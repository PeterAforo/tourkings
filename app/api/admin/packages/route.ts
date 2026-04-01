import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function GET() {
  try {
    await requireAdmin();
    const packages = await db.package.findMany({
      include: { destination: { select: { name: true } }, _count: { select: { bookings: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ packages });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const slug = slugify(body.title);

    const pkg = await db.package.create({
      data: {
        title: body.title,
        slug,
        description: body.description,
        destinationId: body.destinationId,
        price: body.price,
        currency: body.currency || "GHS",
        duration: body.duration,
        groupSize: body.groupSize || 10,
        included: body.included || [],
        excluded: body.excluded || [],
        images: body.images || [],
        featured: body.featured || false,
      },
    });

    return NextResponse.json({ package: pkg }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create package" }, { status: 500 });
  }
}
