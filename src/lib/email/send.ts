import nodemailer, { type Transporter } from "nodemailer";
import { sanitizeHeaderValue } from "@/lib/email/sanitize";

export interface SendMailInput {
  to: string;
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
}

export interface SendMailResult {
  skipped: boolean;
}

let cachedTransporter: Transporter | undefined;

function getTransporter(): Transporter | null {
  const host = process.env.SMTP_HOST;
  if (!host) {
    return null;
  }

  if (!cachedTransporter) {
    cachedTransporter = nodemailer.createTransport({
      host,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: Number(process.env.SMTP_PORT ?? 587) === 465,
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
        : undefined,
    });
  }

  return cachedTransporter;
}

export async function sendMail(input: SendMailInput): Promise<SendMailResult> {
  const transporter = getTransporter();

  if (!transporter) {
    console.warn(
      `SMTP is not configured — email to ${input.to} was not sent (subject: "${input.subject}").`
    );
    return { skipped: true };
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM || "Char Dham Holidays <no-reply@example.com>",
    to: sanitizeHeaderValue(input.to),
    subject: sanitizeHeaderValue(input.subject),
    text: input.text,
    html: input.html,
    replyTo: input.replyTo ? sanitizeHeaderValue(input.replyTo) : undefined,
  });

  return { skipped: false };
}
