import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const featured = searchParams.get("featured");

    const where: Record<string, unknown> = {};
    if (featured === "true") where.featured = true;

    const destinations = await db.destination.findMany({
      where,
      include: { packages: { where: { active: true }, select: { id: true, price: true } } },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ destinations });
  } catch {
    return NextResponse.json({ error: "Failed to fetch destinations" }, { status: 500 });
  }
}
