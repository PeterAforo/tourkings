import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const wallet = await db.wallet.findUnique({
      where: { userId: session.userId },
      include: {
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });

    return NextResponse.json({ wallet });
  } catch {
    return NextResponse.json({ error: "Failed to fetch wallet" }, { status: 500 });
  }
}
