import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyWebhookSignature } from "@/lib/flutterwave";
import { finalizePaymentSuccess } from "@/lib/finalize-payment";

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get("verif-hash");
    if (!signature || !verifyWebhookSignature(signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const body = await req.json();
    const { data } = body;

    if (data.status !== "successful") {
      return NextResponse.json({ received: true });
    }

    const txRef = data.tx_ref;
    const payment = await db.payment.findFirst({
      where: { metadata: { path: ["txRef"], equals: txRef } },
    });

    if (!payment || payment.status === "SUCCESS") {
      return NextResponse.json({ received: true });
    }

    await finalizePaymentSuccess(payment.id, String(data.id));

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
