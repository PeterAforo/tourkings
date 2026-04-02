import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { destinationSchema } from "@/lib/validators";

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
    let data;
    try {
      data = destinationSchema.parse(body);
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json(
          { error: "Validation failed", details: error.issues },
          { status: 400 }
        );
      }
      throw error;
    }

    const slug = slugify(data.name);

    const destination = await db.destination.create({
      data: {
        name: data.name,
        country: data.country,
        description: data.description,
        imageUrl: data.imageUrl ?? null,
        featured: data.featured,
        slug,
      },
    });

    return NextResponse.json({ destination }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create destination" }, { status: 500 });
  }
}
