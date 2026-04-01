import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();
    const customers = await db.user.findMany({
      where: { role: "CUSTOMER" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        createdAt: true,
        wallet: { select: { balance: true, currency: true } },
        _count: { select: { bookings: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ customers });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
