import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { logAdminAction } from "@/lib/admin-log";

/** Shape of `findMany` with user + package selects (no Prisma namespace — CI-safe). */
type BookingExportRow = {
  id: string;
  status: string;
  travelDate: Date | null;
  travelers: number;
  totalAmount: number;
  paidAmount: number;
  createdAt: Date;
  user: { email: string; firstName: string; lastName: string };
  package: { title: string; slug: string };
};

export async function GET() {
  try {
    const admin = await requireAdmin();

    const bookings = (await db.booking.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { email: true, firstName: true, lastName: true } },
        package: { select: { title: true, slug: true } },
      },
    })) as BookingExportRow[];

    const headers = ["id", "status", "travelDate", "travelers", "totalAmount", "paidAmount", "createdAt", "customerEmail", "packageTitle"];
    const escape = (v: string | number | null | undefined) => {
      const s = v == null ? "" : String(v);
      if (s.includes(",") || s.includes('"') || s.includes("\n")) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };

    const rows = bookings.map((b: BookingExportRow) =>
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
