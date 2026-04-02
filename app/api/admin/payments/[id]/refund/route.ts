import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { refundTransaction } from "@/lib/flutterwave";
import { logAdminAction } from "@/lib/admin-log";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;

    const payment = await db.payment.findUnique({
      where: { id },
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    if (payment.status !== "SUCCESS") {
      return NextResponse.json({ error: "Only successful payments can be refunded" }, { status: 400 });
    }

    if (!payment.providerRef) {
      return NextResponse.json({ error: "No provider reference for this payment" }, { status: 400 });
    }

    if (!process.env.FLUTTERWAVE_CLIENT_ID || !process.env.FLUTTERWAVE_CLIENT_SECRET) {
      return NextResponse.json({ error: "Flutterwave is not configured" }, { status: 503 });
    }

    const body = await req.json().catch(() => ({}));
    const amount = typeof body.amount === "number" ? body.amount : undefined;

    const flw = (await refundTransaction(payment.providerRef, amount)) as {
      status?: string;
      message?: string;
      data?: { status?: string };
    };
    const ok =
      flw?.status === "success" ||
      flw?.data?.status === "success" ||
      flw?.data?.status === "succeeded";

    if (!ok) {
      return NextResponse.json(
        { error: (flw?.message as string) || "Refund failed", details: flw },
        { status: 400 }
      );
    }

    await db.payment.update({
      where: { id: payment.id },
      data: { status: "REFUNDED", metadata: { ...(payment.metadata as object), refund: flw } },
    });

    await logAdminAction(admin.userId, "payment.refund", "Payment", payment.id, {
      amount: payment.amount,
    });

    return NextResponse.json({ success: true, payment: { id: payment.id, status: "REFUNDED" } });
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (e instanceof Error && e.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Refund failed" }, { status: 500 });
  }
}
