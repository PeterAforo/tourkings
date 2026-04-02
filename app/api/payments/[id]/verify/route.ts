import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { verifyCharge } from "@/lib/flutterwave";
import { finalizePaymentSuccess } from "@/lib/finalize-payment";

type PaymentMeta = { txRef?: string; chargeId?: string; flw?: string };

function isFlwConfigured(): boolean {
  return !!(
    process.env.FLUTTERWAVE_CLIENT_ID && process.env.FLUTTERWAVE_CLIENT_SECRET
  );
}

/**
 * GET /api/payments/[id]/verify?transaction_id= (legacy) or uses stored v4 chargeId
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

    const meta = payment.metadata as PaymentMeta | null;
    const chargeId = meta?.chargeId || transactionId || undefined;

    if (chargeId && isFlwConfigured()) {
      const flw = (await verifyCharge(chargeId)) as {
        status?: string;
        data?: { status?: string; id?: string };
      };
      const d = flw?.data;
      const ok =
        flw?.status === "success" &&
        d &&
        (d.status === "succeeded" || d.status === "successful");

      if (ok) {
        const ref = String(d.id ?? chargeId);
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
        chargeId == null
          ? "Waiting for payment confirmation. If you completed payment, wait a moment and refresh."
          : "Could not verify with payment provider yet.",
    });
  } catch {
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
