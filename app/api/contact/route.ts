import { NextRequest, NextResponse } from "next/server";
import { contactSchema } from "@/lib/validators";
import { sendEmail } from "@/lib/email";
import { db } from "@/lib/db";
import { escapeHtml } from "@/lib/sanitize";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = contactSchema.parse(body);

    const inquiry = await db.contactInquiry.create({
      data: {
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
        emailSent: false,
      },
    });

    let emailSent = false;
    try {
      await sendEmail({
        to: process.env.CONTACT_EMAIL || "info@tourkings.com",
        subject: `Contact Form: ${data.subject}`,
        html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${escapeHtml(data.name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(data.email)}</p>
        <p><strong>Subject:</strong> ${escapeHtml(data.subject)}</p>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(data.message).replace(/\n/g, "<br>")}</p>
      `,
      });
      emailSent = true;
      await db.contactInquiry.update({
        where: { id: inquiry.id },
        data: { emailSent: true },
      });
    } catch (e) {
      logger.error("Contact email failed", "contact", e);
    }

    return NextResponse.json({
      success: true,
      stored: true,
      emailSent,
      message: emailSent
        ? "Message sent successfully."
        : "Your message was saved. We will respond soon. (Email delivery is not configured — your inquiry is on file.)",
    });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "issues" in error) {
      return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
