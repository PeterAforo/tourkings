const FLW_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY!;
const FLW_BASE_URL = "https://api.flutterwave.com/v3";

interface PaymentInitData {
  amount: number;
  currency: string;
  email: string;
  name: string;
  phone?: string;
  txRef: string;
  redirectUrl: string;
  meta?: Record<string, string>;
}

export async function initializePayment(data: PaymentInitData) {
  const response = await fetch(`${FLW_BASE_URL}/payments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${FLW_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tx_ref: data.txRef,
      amount: data.amount,
      currency: data.currency,
      redirect_url: data.redirectUrl,
      customer: {
        email: data.email,
        name: data.name,
        phonenumber: data.phone,
      },
      customizations: {
        title: "TourKings Payment",
        logo: `${process.env.NEXT_PUBLIC_APP_URL}/logo.png`,
      },
      meta: data.meta,
    }),
  });

  return response.json();
}

export async function verifyTransaction(transactionId: string) {
  const response = await fetch(
    `${FLW_BASE_URL}/transactions/${transactionId}/verify`,
    {
      headers: {
        Authorization: `Bearer ${FLW_SECRET_KEY}`,
      },
    }
  );

  return response.json();
}

export function verifyWebhookSignature(signature: string): boolean {
  const webhookHash = process.env.FLUTTERWAVE_WEBHOOK_HASH;
  return signature === webhookHash;
}

export async function refundTransaction(transactionId: string, amount?: number) {
  const body: Record<string, number> = {};
  if (amount != null && amount > 0) body.amount = amount;

  const response = await fetch(`${FLW_BASE_URL}/transactions/${transactionId}/refund`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${FLW_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  return response.json();
}
