import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { userPreferencesSchema } from "@/lib/validators";
import { ZodError } from "zod";

export type UserPreferences = {
  emailNotifications?: boolean;
  walletAlerts?: boolean;
  bookingUpdates?: boolean;
  preferredCurrency?: string;
};

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: { preferences: true },
    });

    const prefs = (user?.preferences as UserPreferences | null) ?? {};
    return NextResponse.json({ preferences: prefs });
  } catch {
    return NextResponse.json({ error: "Failed to load preferences" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    let data: UserPreferences;
    try {
      data = userPreferencesSchema.parse(body);
    } catch (e) {
      if (e instanceof ZodError) {
        return NextResponse.json({ error: "Validation failed", details: e.issues }, { status: 400 });
      }
      throw e;
    }

    const existing = await db.user.findUnique({
      where: { id: session.userId },
      select: { preferences: true },
    });
    const merged = { ...(existing?.preferences as UserPreferences | null), ...data };

    await db.user.update({
      where: { id: session.userId },
      data: { preferences: merged },
    });

    return NextResponse.json({ preferences: merged });
  } catch {
    return NextResponse.json({ error: "Failed to save preferences" }, { status: 500 });
  }
}
