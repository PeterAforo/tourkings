import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const destination = await db.destination.findUnique({
      where: { slug },
      include: {
        packages: {
          where: { active: true },
          include: { destination: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!destination) {
      return NextResponse.json({ error: "Destination not found" }, { status: 404 });
    }

    return NextResponse.json({ destination });
  } catch {
    return NextResponse.json({ error: "Failed to fetch destination" }, { status: 500 });
  }
}
