import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();
    const content = await db.siteContent.findMany();
    const grouped: Record<string, Record<string, unknown>> = {};
    for (const item of content) {
      if (!grouped[item.section]) grouped[item.section] = {};
      grouped[item.section][item.key] = item.value;
    }
    return NextResponse.json({ content: grouped });
  } catch {
    return NextResponse.json({ error: "Failed to fetch content" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { section, key, value } = body;

    const content = await db.siteContent.upsert({
      where: { section_key: { section, key } },
      update: { value },
      create: { section, key, value },
    });

    return NextResponse.json({ content });
  } catch {
    return NextResponse.json({ error: "Failed to update content" }, { status: 500 });
  }
}
