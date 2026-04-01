import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyWebhookSignature } from "@/lib/flutterwave";
import { sendEmail, paymentConfirmationHtml, walletThresholdHtml } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get("verif-hash");
    if (!signature || !verifyWebhookSignature(signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const body = await req.json();
    const { data } = body;

    if (data.status !== "successful") {
      return NextResponse.json({ received: true });
    }

    const txRef = data.tx_ref;
    const payment = await db.payment.findFirst({
      where: { metadata: { path: ["txRef"], equals: txRef } },
      include: { user: true },
    });

    if (!payment || payment.status === "SUCCESS") {
      return NextResponse.json({ received: true });
    }

    await db.payment.update({
      where: { id: payment.id },
      data: {
        status: "SUCCESS",
        providerRef: String(data.id),
      },
    });

    if (payment.type === "WALLET_TOPUP") {
      const wallet = await db.wallet.findUnique({
        where: { userId: payment.userId },
      });

      if (wallet) {
        const transaction = await db.walletTransaction.create({
          data: {
            walletId: wallet.id,
            amount: payment.amount,
            type: "CREDIT",
            reference: txRef,
            description: "Wallet top-up via Flutterwave",
          },
        });

        await db.payment.update({
          where: { id: payment.id },
          data: { walletTransactionId: transaction.id },
        });

        const newBalance = wallet.balance + payment.amount;
        await db.wallet.update({
          where: { id: wallet.id },
          data: { balance: newBalance },
        });

        const affordablePackages = await db.package.findMany({
          where: { active: true, price: { lte: newBalance } },
          orderBy: { price: "desc" },
          take: 1,
        });

        if (affordablePackages.length > 0) {
          const pkg = affordablePackages[0];
          await db.notification.create({
            data: {
              userId: payment.userId,
              type: "WALLET_THRESHOLD",
              title: "Ready for an adventure?",
              message: `Your wallet balance can now cover the ${pkg.title} package!`,
              metadata: { packageId: pkg.id, packageTitle: pkg.title },
            },
          });

          sendEmail({
            to: payment.user.email,
            subject: `Your savings can cover ${pkg.title}!`,
            html: walletThresholdHtml(
              payment.user.firstName,
              pkg.title,
              pkg.price,
              newBalance,
              wallet.currency
            ),
          }).catch(console.error);
        }
      }
    } else if (payment.type === "BOOKING" && payment.bookingId) {
      await db.booking.update({
        where: { id: payment.bookingId },
        data: {
          paidAmount: { increment: payment.amount },
          status: "CONFIRMED",
        },
      });
    }

    sendEmail({
      to: payment.user.email,
      subject: "Payment Confirmed - TourKings",
      html: paymentConfirmationHtml(payment.amount, payment.currency, payment.type),
    }).catch(console.error);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
