import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();

    const [totalCustomers, totalPackages, totalBookings, payments, recentBookings, recentPayments, bookingGroups, monthlyRows] =
      await Promise.all([
        db.user.count({ where: { role: "CUSTOMER" } }),
        db.package.count(),
        db.booking.count(),
        db.payment.findMany({ where: { status: "SUCCESS" }, select: { amount: true } }),
        db.booking.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          include: { user: { select: { firstName: true, lastName: true } }, package: { select: { title: true } } },
        }),
        db.payment.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          include: { user: { select: { firstName: true, lastName: true } } },
        }),
        db.booking.groupBy({
          by: ["status"],
          _count: { _all: true },
        }),
        db.$queryRaw<Array<{ m: Date; total: number }>>(
          Prisma.sql`
            SELECT date_trunc('month', "createdAt") AS m,
                   COALESCE(SUM(amount), 0)::float AS total
            FROM "Payment"
            WHERE status = 'SUCCESS'
            GROUP BY 1
            ORDER BY 1 DESC
            LIMIT 6
          `
        ),
      ]);

    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

    const bookingStatusCounts = bookingGroups.map((g) => ({
      status: g.status,
      count: g._count._all,
    }));

    const monthFormatter = new Intl.DateTimeFormat("en", { month: "short" });
    const monthlyRevenue = [...monthlyRows]
      .reverse()
      .map((row) => ({
        month: monthFormatter.format(new Date(row.m)),
        amount: row.total,
      }));

    return NextResponse.json({
      stats: {
        totalCustomers,
        totalPackages,
        totalBookings,
        totalRevenue,
        recentBookings,
        recentPayments,
        bookingStatusCounts,
        monthlyRevenue,
      },
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
