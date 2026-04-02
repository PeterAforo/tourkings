import { createHmac, randomUUID } from "node:crypto";

/**
 * Flutterwave v4 API (OAuth client credentials + sandbox/live hosts).
 * @see https://developer.flutterwave.com/v4.0/docs/environments
 * @see https://developer.flutterwave.com/v4.0/docs/payment-orchestrator-flow
 */

const TOKEN_URL =
  "https://idp.flutterwave.com/realms/flutterwave/protocol/openid-connect/token";

function useSandbox(): boolean {
  if (process.env.FLUTTERWAVE_USE_SANDBOX === "true") return true;
  if (process.env.FLUTTERWAVE_USE_SANDBOX === "false") return false;
  return process.env.NODE_ENV !== "production";
}

function getApiBaseUrl(): string {
  return useSandbox()
    ? "https://developersandbox-api.flutterwave.com"
    : "https://f4bexperience.flutterwave.com";
}

let tokenCache: { token: string; expiresAtMs: number } | null = null;

async function getAccessToken(): Promise<string> {
  const clientId = process.env.FLUTTERWAVE_CLIENT_ID;
  const clientSecret = process.env.FLUTTERWAVE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("FLUTTERWAVE_CLIENT_ID and FLUTTERWAVE_CLIENT_SECRET are required");
  }

  const now = Date.now();
  if (tokenCache && now < tokenCache.expiresAtMs - 60_000) {
    return tokenCache.token;
  }

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
    }),
  });

  const data = (await res.json()) as {
    access_token?: string;
    expires_in?: number;
    error?: string;
  };

  if (!res.ok || !data.access_token) {
    throw new Error(data.error || "Failed to obtain Flutterwave access token");
  }

  const expiresInSec = data.expires_in ?? 600;
  tokenCache = {
    token: data.access_token,
    expiresAtMs: now + expiresInSec * 1000,
  };

  return data.access_token;
}

export async function flwV4Fetch(
  path: string,
  init: RequestInit & { idempotencyKey?: string } = {}
): Promise<Response> {
  const token = await getAccessToken();
  const base = getApiBaseUrl();
  const url = path.startsWith("http") ? path : `${base}${path.startsWith("/") ? "" : "/"}${path}`;
  const { idempotencyKey, ...rest } = init;
  const headers = new Headers(rest.headers);
  headers.set("Authorization", `Bearer ${token}`);
  headers.set("Content-Type", "application/json");
  headers.set("X-Trace-Id", randomUUID());
  if (idempotencyKey) {
    headers.set("X-Idempotency-Key", idempotencyKey);
  }
  return fetch(url, { ...rest, headers });
}

export interface PaymentInitData {
  amount: number;
  currency: string;
  email: string;
  name: string;
  phone?: string;
  txRef: string;
  redirectUrl: string;
  meta?: Record<string, string>;
}

/** Ghana MSISDN without country code (e.g. 241234567). */
export function normalizeGhanaPhone(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 9) return null;
  if (digits.startsWith("233")) return digits.slice(3);
  if (digits.startsWith("0")) return digits.slice(1);
  return digits.slice(-9);
}

export interface InitializePaymentResult {
  ok: boolean;
  paymentLink?: string;
  paymentInstruction?: string;
  chargeId?: string;
  raw?: unknown;
  error?: string;
}

/**
 * One-shot charge via Payment Orchestrator (v4).
 * Uses Ghana mobile money — requires a local mobile number on the user profile.
 */
export async function initializePayment(
  data: PaymentInitData
): Promise<InitializePaymentResult> {
  const msisdn = normalizeGhanaPhone(data.phone);
  if (!msisdn) {
    return {
      ok: false,
      error:
        "A Ghana mobile number is required on your profile for Flutterwave v4 (mobile money).",
    };
  }

  const [firstName, ...rest] = data.name.trim().split(/\s+/);
  const lastName = rest.length ? rest.join(" ") : firstName;

  const network = process.env.FLUTTERWAVE_MOMO_NETWORK || "MTN";

  const body = {
    amount: data.amount,
    currency: data.currency,
    reference: data.txRef,
    redirect_url: data.redirectUrl,
    customer: {
      email: data.email,
      name: { first: firstName || "Customer", last: lastName || "." },
      phone: { country_code: "233", number: msisdn },
      address: {
        country: "GH",
        city: "Accra",
        state: "GA",
        postal_code: "00233",
        line1: "—",
      },
      meta: data.meta ?? {},
    },
    payment_method: {
      type: "mobile_money",
      mobile_money: {
        country_code: "233",
        network,
        phone_number: msisdn,
      },
    },
  };

  const res = await flwV4Fetch("/orchestration/direct-charges", {
    method: "POST",
    body: JSON.stringify(body),
    idempotencyKey: data.txRef,
  });

  const json = (await res.json()) as Record<string, unknown>;

  if (!res.ok) {
    return {
      ok: false,
      error:
        (json.message as string) ||
        (json.error as string) ||
        `Flutterwave error (${res.status})`,
      raw: json,
    };
  }

  const status = json.status as string | undefined;
  const payload = json.data as Record<string, unknown> | undefined;
  if (status !== "success" || !payload) {
    return {
      ok: false,
      error: (json.message as string) || "Unexpected Flutterwave response",
      raw: json,
    };
  }

  const chargeId = payload.id as string | undefined;
  const next = payload.next_action as Record<string, unknown> | undefined;
  let paymentLink: string | undefined;
  let paymentInstruction: string | undefined;

  if (next?.type === "redirect_url") {
    const ru = next.redirect_url as { url?: string } | undefined;
    paymentLink = ru?.url;
  } else if (next?.type === "payment_instruction") {
    const pi = next.payment_instruction as { note?: string } | undefined;
    paymentInstruction = pi?.note;
  }

  if (payload.status === "succeeded" && chargeId) {
    return {
      ok: true,
      chargeId,
      raw: json,
    };
  }

  return {
    ok: true,
    paymentLink,
    paymentInstruction,
    chargeId,
    raw: json,
  };
}

/** GET /charges/{chargeId} — verify status (v4). */
export async function verifyCharge(chargeId: string): Promise<unknown> {
  const res = await flwV4Fetch(`/charges/${encodeURIComponent(chargeId)}`, {
    method: "GET",
  });
  return res.json();
}

/**
 * Backward-compatible name: v3 used transaction verify; v4 uses charge id (`chg_…`).
 */
export async function verifyTransaction(idOrChargeId: string): Promise<unknown> {
  return verifyCharge(idOrChargeId);
}

/** POST /refunds (v4). */
export async function refundTransaction(
  chargeId: string,
  amount?: number
): Promise<unknown> {
  const cid = chargeId.startsWith("chg_") ? chargeId : `chg_${chargeId}`;
  const body: Record<string, unknown> = {
    charge_id: cid,
    reason: "Admin refund (TourKings)",
  };
  if (amount != null && amount > 0) body.amount = amount;

  const res = await flwV4Fetch("/refunds", {
    method: "POST",
    body: JSON.stringify(body),
    idempotencyKey: randomUUID(),
  });
  return res.json();
}

/** v4 webhooks: HMAC-SHA256 of raw body, base64 digest. */
export function verifyWebhookSignatureV4(
  rawBody: string,
  signatureHeader: string | null
): boolean {
  const secret = process.env.FLUTTERWAVE_WEBHOOK_SECRET;
  if (!secret || !signatureHeader) return false;
  const hash = createHmac("sha256", secret).update(rawBody).digest("base64");
  return hash === signatureHeader;
}

/** Legacy v3: header `verif-hash` equals dashboard secret string. */
export function verifyWebhookSignature(signature: string): boolean {
  const expected = process.env.FLUTTERWAVE_WEBHOOK_HASH;
  return !!expected && signature === expected;
}
