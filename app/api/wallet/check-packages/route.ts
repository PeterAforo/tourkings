import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { sendEmail, walletThresholdHtml } from "@/lib/email";

export async function POST() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.userId },
      include: { wallet: true },
    });

    if (!user?.wallet) {
      return NextResponse.json({ error: "No wallet found" }, { status: 404 });
    }

    const affordablePackages = await db.package.findMany({
      where: { active: true, price: { lte: user.wallet.balance } },
      orderBy: { price: "desc" },
    });

    if (affordablePackages.length > 0) {
      const existingNotification = await db.notification.findFirst({
        where: {
          userId: user.id,
          type: "WALLET_THRESHOLD",
          read: false,
        },
      });

      if (!existingNotification) {
        const bestPackage = affordablePackages[0];

        await db.notification.create({
          data: {
            userId: user.id,
            type: "WALLET_THRESHOLD",
            title: "Ready for an adventure?",
            message: `Your wallet balance of ${user.wallet.currency} ${user.wallet.balance.toFixed(2)} can cover the ${bestPackage.title} package!`,
            metadata: {
              packageId: bestPackage.id,
              packageTitle: bestPackage.title,
              packagePrice: bestPackage.price,
            },
          },
        });

        sendEmail({
          to: user.email,
          subject: `Your savings can cover ${bestPackage.title}!`,
          html: walletThresholdHtml(
            user.firstName,
            bestPackage.title,
            bestPackage.price,
            user.wallet.balance,
            user.wallet.currency
          ),
        }).catch(console.error);
      }

      return NextResponse.json({
        canAfford: true,
        packages: affordablePackages.map((p) => ({
          id: p.id,
          title: p.title,
          price: p.price,
          slug: p.slug,
        })),
      });
    }

    return NextResponse.json({ canAfford: false, packages: [] });
  } catch {
    return NextResponse.json({ error: "Check failed" }, { status: 500 });
  }
}
