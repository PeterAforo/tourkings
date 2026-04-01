import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();
    const bookings = await db.booking.findMany({
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        package: { include: { destination: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ bookings });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
