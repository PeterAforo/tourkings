import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, getSession } from "@/lib/auth";
import { adminCustomerPatchSchema } from "@/lib/validators";
import { ZodError } from "zod";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    let data: ReturnType<typeof adminCustomerPatchSchema.parse>;
    try {
      data = adminCustomerPatchSchema.parse(body);
    } catch (e) {
      if (e instanceof ZodError) {
        return NextResponse.json({ error: "Validation failed", details: e.issues }, { status: 400 });
      }
      throw e;
    }

    const user = await db.user.update({
      where: { id },
      data: {
        ...(data.firstName && { firstName: data.firstName }),
        ...(data.lastName && { lastName: data.lastName }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.role && { role: data.role }),
      },
      select: { id: true, email: true, firstName: true, lastName: true, phone: true, role: true, createdAt: true },
    });

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "Failed to update customer" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    await requireAdmin();
    const { id } = await params;

    if (session?.userId === id) {
      return NextResponse.json({ error: "You cannot delete your own account while logged in" }, { status: 400 });
    }

    const target = await db.user.findUnique({ where: { id }, select: { role: true } });
    if (target?.role === "ADMIN") {
      const adminCount = await db.user.count({ where: { role: "ADMIN" } });
      if (adminCount <= 1) {
        return NextResponse.json({ error: "Cannot delete the last administrator account" }, { status: 400 });
      }
    }

    await db.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete customer" }, { status: 500 });
  }
}
