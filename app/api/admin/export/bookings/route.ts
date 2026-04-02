import type { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { logAdminAction } from "@/lib/admin-log";

const bookingExportInclude = {
  user: { select: { email: true, firstName: true, lastName: true } },
  package: { select: { title: true, slug: true } },
} satisfies Prisma.BookingInclude;

type BookingExportRow = Prisma.BookingGetPayload<{ include: typeof bookingExportInclude }>;

export async function GET() {
  try {
    const admin = await requireAdmin();

    const bookings: BookingExportRow[] = await db.booking.findMany({
      orderBy: { createdAt: "desc" },
      include: bookingExportInclude,
    });

    const headers = ["id", "status", "travelDate", "travelers", "totalAmount", "paidAmount", "createdAt", "customerEmail", "packageTitle"];
    const escape = (v: string | number | null | undefined) => {
      const s = v == null ? "" : String(v);
      if (s.includes(",") || s.includes('"') || s.includes("\n")) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };

    const rows = bookings.map((b) =>
      [
        b.id,
        b.status,
        b.travelDate?.toISOString() ?? "",
        b.travelers,
        b.totalAmount,
        b.paidAmount,
        b.createdAt.toISOString(),
        b.user.email,
        b.package.title,
      ].map(escape).join(",")
    );

    const csv = [headers.join(","), ...rows].join("\n");

    await logAdminAction(admin.userId, "export.bookings", "Booking", undefined, { count: bookings.length });

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="tourkings-bookings-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (e instanceof Error && e.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
