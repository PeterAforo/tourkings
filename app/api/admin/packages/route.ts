import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { packageSchema } from "@/lib/validators";
import { logger } from "@/lib/logger";

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
    let data;
    try {
      data = packageSchema.parse(body);
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json(
          { error: "Validation failed", details: error.issues },
          { status: 400 }
        );
      }
      throw error;
    }

    const slug = slugify(data.title);

    const pkg = await db.package.create({
      data: {
        title: data.title,
        slug,
        description: data.description,
        destinationId: data.destinationId,
        price: data.price,
        currency: data.currency,
        duration: data.duration,
        groupSize: data.groupSize,
        included: data.included,
        excluded: data.excluded,
        images: data.images,
        featured: data.featured,
        active: data.active,
      },
    });

    return NextResponse.json({ package: pkg }, { status: 201 });
  } catch (error) {
    logger.error("Failed to create package", "admin-packages", error);
    return NextResponse.json({ error: "Failed to create package" }, { status: 500 });
  }
}
