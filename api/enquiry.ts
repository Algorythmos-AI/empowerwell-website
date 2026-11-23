/**
 * POST /api/enquiry — the website enquiry form posts here (Vercel Function, Node.js runtime).
 *
 * Emails each enquiry to the business inbox through Zoho Mail's Australian SMTP server.
 * Environment variables (Vercel → Project → Settings → Environment Variables, Production):
 *   ZOHO_SMTP_USER      the Zoho mailbox that signs in (lual.chol@empowerwellsupport.com.au)
 *   ZOHO_SMTP_PASSWORD  a Zoho *app-specific* password for that mailbox (never the login password)
 *   ENQUIRY_TO          optional; inbox that receives enquiries (default info@)
 *   ENQUIRY_FROM        optional; sender address, must be the mailbox or one of its aliases (default info@)
 * Without the first two, the function answers 503 and the form falls back to a pre-filled email.
 */
import nodemailer from "nodemailer";
import { handleEnquiry, type OutgoingEmail } from "../src/lib/enquiryHandler.js";

const user = process.env.ZOHO_SMTP_USER ?? "";
const pass = process.env.ZOHO_SMTP_PASSWORD ?? "";

const transport = nodemailer.createTransport({
  host: process.env.ZOHO_SMTP_HOST || "smtp.zoho.com.au",
  port: 465,
  secure: true,
  auth: { user, pass },
  connectionTimeout: 10_000,
  greetingTimeout: 10_000,
  socketTimeout: 15_000,
});

async function send(email: OutgoingEmail): Promise<void> {
  await transport.sendMail({
    from: { name: "Empowerwell Support Website", address: email.from },
    to: email.to,
    replyTo: email.replyTo,
    subject: email.subject,
    text: email.text,
    html: email.html,
  });
}

export async function POST(request: Request): Promise<Response> {
  return handleEnquiry(request, {
    send,
    configured: Boolean(user && pass),
    to: process.env.ENQUIRY_TO,
    from: process.env.ENQUIRY_FROM,
  });
}
