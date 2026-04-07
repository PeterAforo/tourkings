import { db } from "@/lib/db";
import { sendEmail, paymentConfirmationHtml, walletThresholdHtml } from "@/lib/email";
import { logger } from "@/lib/logger";

/**
 * Marks a payment successful and runs wallet credit or booking confirmation.
 * Safe to call multiple times; no-ops if already SUCCESS.
 */
export async function finalizePaymentSuccess(paymentId: string, providerRef: string) {
  const payment = await db.payment.findUnique({
    where: { id: paymentId },
    include: { user: true },
  });

  if (!payment || payment.status === "SUCCESS") {
    return { ok: true, alreadyDone: payment?.status === "SUCCESS" };
  }

  await db.payment.update({
    where: { id: payment.id },
    data: {
      status: "SUCCESS",
      providerRef,
    },
  });

  if (payment.type === "WALLET_TOPUP") {
    const wallet = await db.wallet.findUnique({
      where: { userId: payment.userId },
    });

    if (wallet) {
      const txRef = (payment.metadata as { txRef?: string })?.txRef ?? providerRef;
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
        }).catch((e) => logger.error("Wallet threshold email failed", "finalize-payment", e));
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
  }).catch((e) => logger.error("Payment confirmation email failed", "finalize-payment", e));

  return { ok: true, alreadyDone: false };
}
