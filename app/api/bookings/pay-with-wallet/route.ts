import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { sendEmail, bookingConfirmationHtml } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { bookingId } = body;

    if (!bookingId || typeof bookingId !== "string") {
      return NextResponse.json({ error: "bookingId is required" }, { status: 400 });
    }

    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: { package: { include: { destination: true } } },
    });

    if (!booking || booking.userId !== session.userId) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.status !== "PENDING") {
      return NextResponse.json({ error: "Booking is not pending" }, { status: 400 });
    }

    const amountDue = booking.totalAmount - booking.paidAmount;
    if (amountDue <= 0) {
      return NextResponse.json({ error: "Booking is already fully paid" }, { status: 400 });
    }

    const wallet = await db.wallet.findUnique({
      where: { userId: session.userId },
    });

    if (!wallet || wallet.balance < amountDue) {
      return NextResponse.json(
        {
          error: "Insufficient wallet balance",
          required: amountDue,
          available: wallet?.balance ?? 0,
        },
        { status: 400 }
      );
    }

    // Execute wallet debit, booking confirmation, and payment record in a transaction
    const [payment] = await db.$transaction([
      db.payment.create({
        data: {
          userId: session.userId,
          bookingId: booking.id,
          amount: amountDue,
          currency: wallet.currency,
          provider: "wallet",
          providerRef: `wallet-${Date.now()}`,
          status: "SUCCESS",
          type: "BOOKING",
        },
      }),
      db.walletTransaction.create({
        data: {
          walletId: wallet.id,
          amount: amountDue,
          type: "DEBIT",
          reference: `booking-${booking.id}`,
          description: `Payment for ${booking.package.title}`,
        },
      }),
      db.wallet.update({
        where: { id: wallet.id },
        data: { balance: { decrement: amountDue } },
      }),
      db.booking.update({
        where: { id: booking.id },
        data: {
          paidAmount: { increment: amountDue },
          status: "CONFIRMED",
        },
      }),
    ]);

    // Send confirmation email
    const user = await db.user.findUnique({ where: { id: session.userId } });
    if (user) {
      sendEmail({
        to: user.email,
        subject: "Booking Confirmed - TourKings",
        html: bookingConfirmationHtml(
          user.firstName,
          booking.package.title,
          booking.travelDate?.toLocaleDateString() || "To be confirmed"
        ),
      }).catch(() => {});
    }

    return NextResponse.json({
      ok: true,
      payment: { id: payment.id, amount: amountDue, status: "SUCCESS" },
      message: "Booking paid successfully from your wallet!",
    });
  } catch {
    return NextResponse.json({ error: "Failed to process wallet payment" }, { status: 500 });
  }
}
