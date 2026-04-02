import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sanitizeUnsplashImageUrl } from "@/lib/site-content-defaults";

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

    const sanitized = destinations.map((d) => ({
      ...d,
      imageUrl: d.imageUrl ? sanitizeUnsplashImageUrl(d.imageUrl) : null,
    }));

    return NextResponse.json({ destinations: sanitized });
  } catch {
    return NextResponse.json({ error: "Failed to fetch destinations" }, { status: 500 });
  }
}
