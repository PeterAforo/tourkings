import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { initializePayment } from "@/lib/flutterwave";
import { finalizePaymentSuccess } from "@/lib/finalize-payment";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { amount, type, bookingId } = body;

    const user = await db.user.findUnique({
      where: { id: session.userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const txRef = `TK-${type}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    const payment = await db.payment.create({
      data: {
        userId: session.userId,
        amount,
        currency: "GHS",
        type,
        bookingId: bookingId || null,
        status: "PENDING",
        metadata: { txRef, flw: "v4" },
      },
    });

    const result = await initializePayment({
      amount,
      currency: "GHS",
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      phone: user.phone || undefined,
      txRef,
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/payments/verify?paymentId=${payment.id}`,
      meta: {
        paymentId: payment.id,
        type,
        bookingId: bookingId || "",
      },
    });

    if (!result.ok) {
      await db.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED", metadata: { txRef, flw: "v4", error: result.error } },
      });
      return NextResponse.json(
        { error: result.error || "Failed to initialize payment" },
        { status: 400 }
      );
    }

    const chargeId = result.chargeId;
    await db.payment.update({
      where: { id: payment.id },
      data: {
        metadata: {
          txRef,
          flw: "v4",
          ...(chargeId ? { chargeId } : {}),
        },
      },
    });

    const raw = result.raw as { data?: { status?: string; id?: string } } | undefined;
    const immediateStatus = raw?.data?.status;
    if (immediateStatus === "succeeded" && chargeId) {
      await finalizePaymentSuccess(payment.id, chargeId);
      return NextResponse.json({
        paymentId: payment.id,
        completed: true,
      });
    }

    if (result.paymentLink) {
      return NextResponse.json({
        paymentLink: result.paymentLink,
        paymentId: payment.id,
      });
    }

    if (result.paymentInstruction) {
      return NextResponse.json({
        paymentInstruction: result.paymentInstruction,
        paymentId: payment.id,
        chargeId,
      });
    }

    return NextResponse.json({
      paymentId: payment.id,
      chargeId,
      pending: true,
      message:
        "Payment started. Complete authorization on your phone or wait for confirmation.",
    });
  } catch (e) {
    console.error("Payment initialize:", e);
    return NextResponse.json({ error: "Payment initialization failed" }, { status: 500 });
  }
}
