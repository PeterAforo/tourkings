import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const { name, country, description, imageUrl, featured } = body;

    const data: Record<string, unknown> = {};
    if (name !== undefined) {
      data.name = name;
      data.slug = slugify(name);
    }
    if (country !== undefined) data.country = country;
    if (description !== undefined) data.description = description;
    if (imageUrl !== undefined) data.imageUrl = imageUrl || null;
    if (featured !== undefined) data.featured = featured;

    const destination = await db.destination.update({
      where: { id },
      data,
    });

    return NextResponse.json({ destination });
  } catch {
    return NextResponse.json({ error: "Failed to update destination" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    await db.destination.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete destination" }, { status: 500 });
  }
}
