import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const pkg = await db.package.findUnique({
      where: { slug },
      include: {
        destination: true,
        bookings: { select: { id: true } },
      },
    });

    if (!pkg) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    return NextResponse.json({ package: pkg });
  } catch {
    return NextResponse.json({ error: "Failed to fetch package" }, { status: 500 });
  }
}
