import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const featured = searchParams.get("featured");
    const destination = searchParams.get("destination");
    const search = searchParams.get("search");
    const limit = searchParams.get("limit");

    const where: Record<string, unknown> = { active: true };

    if (featured === "true") where.featured = true;
    if (destination) where.destinationId = destination;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const packages = await db.package.findMany({
      where,
      include: { destination: true },
      orderBy: { createdAt: "desc" },
      ...(limit ? { take: parseInt(limit) } : {}),
    });

    return NextResponse.json({ packages });
  } catch {
    return NextResponse.json({ error: "Failed to fetch packages" }, { status: 500 });
  }
}
