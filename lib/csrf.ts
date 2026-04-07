import { NextRequest, NextResponse } from "next/server";

const CSRF_COOKIE = "csrf_token";
const CSRF_HEADER = "x-csrf-token";

/**
 * Generate a random CSRF token (Edge-compatible).
 */
export function generateCsrfToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Set a CSRF cookie on a response. Call this when serving pages or on GET /api/auth/me.
 */
export function setCsrfCookie(response: NextResponse, token?: string): string {
  const t = token || generateCsrfToken();
  response.cookies.set(CSRF_COOKIE, t, {
    httpOnly: false, // Must be readable by JS to send in header
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
  });
  return t;
}

/**
 * Validate CSRF token: the header value must match the cookie value.
 * Skips validation for:
 *  - GET, HEAD, OPTIONS requests
 *  - Webhook endpoints (Flutterwave sends POST without our CSRF token)
 *  - Public POST endpoints that don't use cookies for auth
 */
export function validateCsrf(req: NextRequest): boolean {
  const method = req.method.toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
    return true;
  }

  const { pathname } = req.nextUrl;

  // Skip CSRF for webhook endpoints and public auth endpoints
  const skipPaths = [
    "/api/payments/webhook",
    "/api/auth/login",
    "/api/auth/register",
    "/api/auth/logout",
    "/api/auth/forgot-password",
    "/api/auth/reset-password",
    "/api/contact",
    "/api/public/",
  ];

  if (skipPaths.some((p) => pathname.startsWith(p))) {
    return true;
  }

  // For all other state-changing API calls, verify CSRF
  if (!pathname.startsWith("/api/")) {
    return true;
  }

  const cookieToken = req.cookies.get(CSRF_COOKIE)?.value;
  const headerToken = req.headers.get(CSRF_HEADER);

  if (!cookieToken || !headerToken) return false;
  return cookieToken === headerToken;
}
