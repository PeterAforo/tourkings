import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();
    const payments = await db.payment.findMany({
      include: { user: { select: { firstName: true, lastName: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ payments });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
