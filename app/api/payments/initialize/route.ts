import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { initializePayment } from "@/lib/flutterwave";

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
        metadata: { txRef },
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

    if (result.status === "success") {
      return NextResponse.json({ paymentLink: result.data.link, paymentId: payment.id });
    }

    return NextResponse.json({ error: "Failed to initialize payment" }, { status: 500 });
  } catch {
    return NextResponse.json({ error: "Payment initialization failed" }, { status: 500 });
  }
}
