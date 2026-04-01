import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function GET() {
  try {
    await requireAdmin();
    const destinations = await db.destination.findMany({
      include: { _count: { select: { packages: true } } },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ destinations });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const slug = slugify(body.name);

    const destination = await db.destination.create({
      data: {
        name: body.name,
        country: body.country,
        description: body.description,
        imageUrl: body.imageUrl || null,
        featured: body.featured || false,
        slug,
      },
    });

    return NextResponse.json({ destination }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create destination" }, { status: 500 });
  }
}
