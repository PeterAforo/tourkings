import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, signToken } from "@/lib/auth";
import { registerSchema } from "@/lib/validators";
import { sendEmail, welcomeEmailHtml, emailVerificationHtml } from "@/lib/email";
import { checkRateLimit, getClientIp, AUTH_RATE_LIMIT } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers);
    const rl = checkRateLimit(`register:${ip}`, AUTH_RATE_LIMIT);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again later." },
        { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
      );
    }

    const body = await req.json();
    const data = registerSchema.parse(body);

    const existingUser = await db.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(data.password);

    const user = await db.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        wallet: {
          create: { balance: 0, currency: "GHS" },
        },
      },
    });

    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Send welcome email
    sendEmail({
      to: user.email,
      subject: "Welcome to TourKings!",
      html: welcomeEmailHtml(user.firstName),
    }).catch((err) => logger.error("Failed to send welcome email", "register", err));

    // Create email verification token and send verification email
    const verifyBytes = new Uint8Array(32);
    crypto.getRandomValues(verifyBytes);
    const verifyToken = Array.from(verifyBytes, (b) => b.toString(16).padStart(2, "0")).join("");
    await db.emailVerificationToken.create({
      data: {
        email: user.email,
        token: verifyToken,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    sendEmail({
      to: user.email,
      subject: "Verify Your Email - TourKings",
      html: emailVerificationHtml(user.firstName, `${baseUrl}/verify-email?token=${verifyToken}`),
    }).catch((err) => logger.error("Failed to send verification email", "register", err));

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error: unknown) {
    if (error && typeof error === "object" && "errors" in error) {
      return NextResponse.json({ error: "Validation failed", details: (error as { errors: unknown }).errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
