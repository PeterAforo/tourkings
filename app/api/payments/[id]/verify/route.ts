import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { verifyTransaction } from "@/lib/flutterwave";
import { finalizePaymentSuccess } from "@/lib/finalize-payment";

/**
 * GET /api/payments/[id]/verify?transaction_id=FLW_ID
 * Confirms payment for the logged-in owner; optionally verifies with Flutterwave when still PENDING.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const transactionId = searchParams.get("transaction_id");

    const payment = await db.payment.findFirst({
      where: { id, userId: session.userId },
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    if (payment.status === "SUCCESS") {
      return NextResponse.json({
        status: "SUCCESS",
        amount: payment.amount,
        currency: payment.currency,
        type: payment.type,
      });
    }

    if (payment.status === "FAILED" || payment.status === "REFUNDED") {
      return NextResponse.json({
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
      });
    }

    if (transactionId && process.env.FLUTTERWAVE_SECRET_KEY) {
      const flw = await verifyTransaction(transactionId);
      const flwData = flw?.data;
      const ok =
        flw?.status === "success" &&
        flwData &&
        (flwData.status === "successful" || flwData.status === "success");

      if (ok) {
        const ref = String(flwData.id ?? transactionId);
        await finalizePaymentSuccess(payment.id, ref);
        const updated = await db.payment.findUnique({ where: { id: payment.id } });
        return NextResponse.json({
          status: updated?.status ?? "SUCCESS",
          amount: updated?.amount ?? payment.amount,
          currency: updated?.currency ?? payment.currency,
          type: payment.type,
        });
      }
    }

    return NextResponse.json({
      status: payment.status,
      pending: true,
      amount: payment.amount,
      currency: payment.currency,
      message:
        transactionId == null
          ? "Waiting for payment confirmation. If you completed payment, open the link from your email or wait a moment and refresh."
          : "Could not verify with payment provider yet.",
    });
  } catch {
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
