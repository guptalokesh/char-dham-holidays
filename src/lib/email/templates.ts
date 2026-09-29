import { escapeHtml, sanitizeHeaderValue } from "@/lib/email/sanitize";

export interface EnquiryEmailInput {
  name: string;
  phone: string;
  email?: string | null;
  service: string;
  message?: string | null;
  businessName: string;
}

export interface EmailContent {
  subject: string;
  text: string;
  html: string;
}

export function buildEnquiryNotificationEmail(input: EnquiryEmailInput): EmailContent {
  const safeName = sanitizeHeaderValue(input.name);
  const safeService = sanitizeHeaderValue(input.service);
  const email = input.email?.trim() || "—";
  const message = input.message?.trim() || "—";

  const subject = `New enquiry: ${safeService} — ${safeName}`;

  const text = [
    `New enquiry received on the ${input.businessName} website.`,
    "",
    `Name: ${input.name}`,
    `Phone: ${input.phone}`,
    `Email: ${email}`,
    `Service: ${input.service}`,
    `Message: ${message}`,
  ].join("\n");

  const html = [
    `<p>New enquiry received on the ${escapeHtml(input.businessName)} website.</p>`,
    "<ul>",
    `<li><strong>Name:</strong> ${escapeHtml(input.name)}</li>`,
    `<li><strong>Phone:</strong> ${escapeHtml(input.phone)}</li>`,
    `<li><strong>Email:</strong> ${escapeHtml(email)}</li>`,
    `<li><strong>Service:</strong> ${escapeHtml(input.service)}</li>`,
    `<li><strong>Message:</strong> ${escapeHtml(message)}</li>`,
    "</ul>",
  ].join("\n");

  return { subject, text, html };
}

export function buildEnquiryAcknowledgementEmail(input: EnquiryEmailInput): EmailContent {
  const safeBusinessName = sanitizeHeaderValue(input.businessName);
  const subject = `We've received your enquiry — ${safeBusinessName}`;

  const text = [
    `Hi ${input.name},`,
    "",
    `Thank you for reaching out to ${input.businessName}. We have received your enquiry ` +
      `regarding ${input.service} and will get back to you shortly.`,
    "",
    "This is an automatic acknowledgement. Our team will contact you directly to discuss " +
      "availability and next steps.",
  ].join("\n");

  const html = [
    `<p>Hi ${escapeHtml(input.name)},</p>`,
    `<p>Thank you for reaching out to ${escapeHtml(input.businessName)}. We have received your ` +
      `enquiry regarding <strong>${escapeHtml(input.service)}</strong> and will get back to you ` +
      "shortly.</p>",
    "<p>This is an automatic acknowledgement. Our team will contact you directly to discuss " +
      "availability and next steps.</p>",
  ].join("\n");

  return { subject, text, html };
}
