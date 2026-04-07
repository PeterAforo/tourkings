import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendEmail, passwordResetHtml } from "@/lib/email";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers);
    const rl = checkRateLimit(`forgot:${ip}`, { maxRequests: 5, windowSeconds: 300 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Always return success to prevent email enumeration
    const successResponse = {
      ok: true,
      message: "If an account exists for that email, you will receive password reset instructions shortly.",
    };

    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(successResponse);
    }

    // Invalidate any existing tokens for this email
    await db.passwordResetToken.updateMany({
      where: { email, used: false },
      data: { used: true },
    });

    // Create a new reset token (expires in 1 hour)
    const token = generateToken();
    await db.passwordResetToken.create({
      data: {
        email,
        token,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetLink = `${baseUrl}/reset-password?token=${token}`;

    sendEmail({
      to: email,
      subject: "Reset Your Password - TourKings",
      html: passwordResetHtml(user.firstName, resetLink),
    }).catch(() => {});

    return NextResponse.json(successResponse);
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
