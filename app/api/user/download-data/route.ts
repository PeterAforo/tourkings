import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        emailVerified: true,
        preferences: true,
        createdAt: true,
        updatedAt: true,
        wallet: {
          select: {
            balance: true,
            currency: true,
            transactions: {
              select: {
                amount: true,
                type: true,
                reference: true,
                description: true,
                createdAt: true,
              },
              orderBy: { createdAt: "desc" },
            },
          },
        },
        bookings: {
          select: {
            id: true,
            status: true,
            travelDate: true,
            travelers: true,
            totalAmount: true,
            paidAmount: true,
            createdAt: true,
            package: {
              select: { title: true, destination: { select: { name: true } } },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        payments: {
          select: {
            amount: true,
            currency: true,
            status: true,
            type: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
        notifications: {
          select: {
            type: true,
            title: true,
            message: true,
            read: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const jsonData = JSON.stringify(user, null, 2);
    const filename = `tourkings-data-${user.email.replace(/[^a-z0-9]/gi, "_")}-${new Date().toISOString().split("T")[0]}.json`;

    return new NextResponse(jsonData, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 });
  }
}
