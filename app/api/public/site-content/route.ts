import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { mergePublicSiteContent } from "@/lib/site-content-defaults";

/** Public read-only CMS payload for the marketing site (no auth). */
export async function GET() {
  try {
    const rows = await db.siteContent.findMany();
    const grouped: Record<string, Record<string, unknown>> = {};
    for (const item of rows) {
      if (!grouped[item.section]) grouped[item.section] = {};
      grouped[item.section][item.key] = item.value;
    }
    const content = mergePublicSiteContent(grouped);
    return NextResponse.json({ content });
  } catch {
    return NextResponse.json({ error: "Failed to load content" }, { status: 500 });
  }
}
