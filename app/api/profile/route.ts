import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { firstName, lastName, phone, currentPassword, newPassword } = body;

    const updateData: Record<string, string> = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phone !== undefined) updateData.phone = phone;

    if (currentPassword && newPassword) {
      const user = await db.user.findUnique({ where: { id: session.userId } });
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

      const valid = await bcrypt.compare(currentPassword, user.password);
      if (!valid) return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });

      updateData.password = await bcrypt.hash(newPassword, 12);
    }

    const user = await db.user.update({
      where: { id: session.userId },
      data: updateData,
      select: { id: true, email: true, firstName: true, lastName: true, phone: true, role: true, avatarUrl: true, createdAt: true },
    });

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
