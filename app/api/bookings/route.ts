import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { bookingSchema } from "@/lib/validators";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bookings = await db.booking.findMany({
      where: { userId: session.userId },
      include: { package: { include: { destination: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ bookings });
  } catch {
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = bookingSchema.parse(body);

    const pkg = await db.package.findUnique({
      where: { id: data.packageId },
    });

    if (!pkg) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    const totalAmount = pkg.price * data.travelers;

    const booking = await db.booking.create({
      data: {
        userId: session.userId,
        packageId: data.packageId,
        travelDate: data.travelDate ? new Date(data.travelDate) : null,
        travelers: data.travelers,
        totalAmount,
        notes: data.notes,
      },
      include: { package: { include: { destination: true } } },
    });

    return NextResponse.json({ booking }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}
