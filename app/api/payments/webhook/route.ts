import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  verifyWebhookSignature,
  verifyWebhookSignatureV4,
} from "@/lib/flutterwave";
import { finalizePaymentSuccess } from "@/lib/finalize-payment";
import { logger } from "@/lib/logger";

/**
 * Flutterwave v4: `flutterwave-signature` header (HMAC-SHA256 of raw body, base64).
 * Legacy v3: `verif-hash` header equals FLUTTERWAVE_WEBHOOK_HASH.
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const v4Sig = req.headers.get("flutterwave-signature");
    const v3Hash = req.headers.get("verif-hash");

    if (v4Sig) {
      if (!verifyWebhookSignatureV4(rawBody, v4Sig)) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    } else if (v3Hash) {
      if (!verifyWebhookSignature(v3Hash)) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    } else {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: { type?: string; data?: Record<string, unknown> };
    try {
      body = JSON.parse(rawBody) as { type?: string; data?: Record<string, unknown> };
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    if (body.type === "charge.completed" && body.data) {
      const d = body.data;
      if (d.status !== "succeeded") {
        return NextResponse.json({ received: true });
      }
      const reference = d.reference as string | undefined;
      if (!reference) {
        return NextResponse.json({ received: true });
      }
      const payment = await db.payment.findFirst({
        where: { metadata: { path: ["txRef"], equals: reference } },
      });

      if (!payment || payment.status === "SUCCESS") {
        return NextResponse.json({ received: true });
      }

      await finalizePaymentSuccess(payment.id, String(d.id));
      return NextResponse.json({ received: true });
    }

    const data = body.data as
      | { status?: string; tx_ref?: string; id?: string | number }
      | undefined;
    if (!data || data.status !== "successful") {
      return NextResponse.json({ received: true });
    }

    const txRef = data.tx_ref;
    if (!txRef) {
      return NextResponse.json({ received: true });
    }

    const payment = await db.payment.findFirst({
      where: { metadata: { path: ["txRef"], equals: txRef } },
    });

    if (!payment || payment.status === "SUCCESS") {
      return NextResponse.json({ received: true });
    }

    await finalizePaymentSuccess(payment.id, String(data.id));

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error("Webhook processing failed", "webhook", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
