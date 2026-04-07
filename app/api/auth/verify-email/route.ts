import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Verification token is required" }, { status: 400 });
    }

    const verificationToken = await db.emailVerificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken || verificationToken.used || verificationToken.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Invalid or expired verification token" },
        { status: 400 }
      );
    }

    await db.$transaction([
      db.user.update({
        where: { email: verificationToken.email },
        data: { emailVerified: true },
      }),
      db.emailVerificationToken.update({
        where: { id: verificationToken.id },
        data: { used: true },
      }),
    ]);

    return NextResponse.json({
      ok: true,
      message: "Email verified successfully!",
    });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
