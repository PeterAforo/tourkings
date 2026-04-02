import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();
    const settings = await db.siteContent.findMany({ where: { section: "settings" } });
    const result: Record<string, unknown> = {};
    for (const s of settings) result[s.key] = s.value;
    return NextResponse.json({ settings: result });
  } catch {
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();

    const updates = Object.entries(body).map(([key, value]) =>
      db.siteContent.upsert({
        where: { section_key: { section: "settings", key } },
        update: { value: value as object },
        create: { section: "settings", key, value: value as object },
      })
    );

    await Promise.all(updates);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
