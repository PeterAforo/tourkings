import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  if (!process.env.SMTP_USER) {
    console.log(`[Email] Would send to ${to}: ${subject}`);
    return;
  }

  await transporter.sendMail({
    from: `"TourKings" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
}

export function welcomeEmailHtml(firstName: string): string {
  return `
    <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; background: #0F0F1A; color: #fff; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #D4A017, #B8860B); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px; color: #0F0F1A;">Welcome to TourKings!</h1>
      </div>
      <div style="padding: 30px;">
        <p style="font-size: 16px; line-height: 1.6;">Dear ${firstName},</p>
        <p style="font-size: 16px; line-height: 1.6;">Welcome to TourKings! We're thrilled to have you join our family of adventurers.</p>
        <p style="font-size: 16px; line-height: 1.6;">Start exploring our curated tour packages across Ghana and beyond. You can also save towards your dream vacation using your TourKings wallet.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/packages" style="background: #D4A017; color: #0F0F1A; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">Explore Packages</a>
        </div>
        <p style="font-size: 14px; color: #888;">Happy Travels,<br/>The TourKings Team</p>
      </div>
    </div>
  `;
}

export function paymentConfirmationHtml(amount: number, currency: string, type: string): string {
  return `
    <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; background: #0F0F1A; color: #fff; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #2E7D32, #1B5E20); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px; color: #fff;">Payment Confirmed</h1>
      </div>
      <div style="padding: 30px;">
        <p style="font-size: 16px; line-height: 1.6;">Your payment of <strong>${currency} ${amount.toFixed(2)}</strong> has been successfully processed.</p>
        <p style="font-size: 16px; line-height: 1.6;">Type: ${type === "WALLET_TOPUP" ? "Wallet Top-up" : "Booking Payment"}</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="background: #D4A017; color: #0F0F1A; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;">View Dashboard</a>
        </div>
      </div>
    </div>
  `;
}

export function walletThresholdHtml(firstName: string, packageTitle: string, packagePrice: number, walletBalance: number, currency: string): string {
  return `
    <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; background: #0F0F1A; color: #fff; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #D4A017, #B8860B); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px; color: #0F0F1A;">Ready for an Adventure?</h1>
      </div>
      <div style="padding: 30px;">
        <p style="font-size: 16px; line-height: 1.6;">Hi ${firstName},</p>
        <p style="font-size: 16px; line-height: 1.6;">Great news! Your wallet balance of <strong>${currency} ${walletBalance.toFixed(2)}</strong> can now cover the <strong>${packageTitle}</strong> package (${currency} ${packagePrice.toFixed(2)}).</p>
        <p style="font-size: 16px; line-height: 1.6;">Would you like to book this experience now?</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/wallet" style="background: #D4A017; color: #0F0F1A; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">Book Now</a>
        </div>
        <p style="font-size: 14px; color: #888;">Not ready yet? No worries — your savings will keep growing for even bigger adventures!</p>
      </div>
    </div>
  `;
}

export function bookingConfirmationHtml(firstName: string, packageTitle: string, travelDate: string): string {
  return `
    <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; background: #0F0F1A; color: #fff; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #2E7D32, #1B5E20); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px; color: #fff;">Booking Confirmed!</h1>
      </div>
      <div style="padding: 30px;">
        <p style="font-size: 16px; line-height: 1.6;">Dear ${firstName},</p>
        <p style="font-size: 16px; line-height: 1.6;">Your booking for <strong>${packageTitle}</strong> has been confirmed!</p>
        <p style="font-size: 16px; line-height: 1.6;">Travel Date: <strong>${travelDate}</strong></p>
        <p style="font-size: 16px; line-height: 1.6;">We'll be in touch with more details as your travel date approaches.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/bookings" style="background: #D4A017; color: #0F0F1A; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;">View Booking</a>
        </div>
      </div>
    </div>
  `;
}
