import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, signToken } from "@/lib/auth";
import { registerSchema } from "@/lib/validators";
import { sendEmail, welcomeEmailHtml } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
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

    sendEmail({
      to: user.email,
      subject: "Welcome to TourKings!",
      html: welcomeEmailHtml(user.firstName),
    }).catch(console.error);

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
