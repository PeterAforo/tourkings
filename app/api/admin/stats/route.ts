import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();

    const [totalCustomers, totalPackages, totalBookings, payments, recentBookings, recentPayments] = await Promise.all([
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
    ]);

    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

    return NextResponse.json({
      stats: { totalCustomers, totalPackages, totalBookings, totalRevenue, recentBookings, recentPayments },
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
