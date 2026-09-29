import { describe, expect, it } from "vitest";
import {
  buildEnquiryAcknowledgementEmail,
  buildEnquiryNotificationEmail,
} from "@/lib/email/templates";

const baseInput = {
  name: "Priya Sharma",
  phone: "+91 98765 43210",
  email: "priya@example.com",
  service: "Devrana Trek",
  message: "Interested in a group of 4, early December.",
  businessName: "Char Dham Holidays",
};

describe("buildEnquiryNotificationEmail", () => {
  it("includes all enquiry fields in the text and html versions", () => {
    const result = buildEnquiryNotificationEmail(baseInput);

    expect(result.subject).toContain("Devrana Trek");
    expect(result.subject).toContain("Priya Sharma");
    expect(result.text).toContain(baseInput.phone);
    expect(result.text).toContain(baseInput.email);
    expect(result.text).toContain(baseInput.message);
    expect(result.html).toContain(baseInput.phone);
  });

  it("neutralizes an HTML/script injection attempt in the message", () => {
    const result = buildEnquiryNotificationEmail({
      ...baseInput,
      message: "<script>alert('xss')</script>",
    });

    expect(result.html).not.toContain("<script>");
    expect(result.html).toContain("&lt;script&gt;");
  });

  it("neutralizes a header-injection attempt in the name", () => {
    const result = buildEnquiryNotificationEmail({
      ...baseInput,
      name: "Evil\r\nBcc: attacker@evil.example",
    });

    expect(result.subject).not.toContain("\r");
    expect(result.subject).not.toContain("\n");
  });

  it("shows a placeholder when the message or email is missing", () => {
    const result = buildEnquiryNotificationEmail({
      ...baseInput,
      email: null,
      message: null,
    });

    expect(result.text).toMatch(/Email: —/);
    expect(result.text).toMatch(/Message: —/);
  });
});

describe("buildEnquiryAcknowledgementEmail", () => {
  it("addresses the customer by name and references their service", () => {
    const result = buildEnquiryAcknowledgementEmail(baseInput);

    expect(result.text).toContain("Priya Sharma");
    expect(result.text).toContain("Devrana Trek");
    expect(result.html).toContain("Devrana Trek");
  });

  it("does not claim the booking is confirmed", () => {
    const result = buildEnquiryAcknowledgementEmail(baseInput);

    expect(result.text.toLowerCase()).not.toContain("confirmed");
    expect(result.text.toLowerCase()).not.toContain("your booking is");
  });

  it("escapes HTML in the customer-supplied name", () => {
    const result = buildEnquiryAcknowledgementEmail({
      ...baseInput,
      name: "<b>Hacker</b>",
    });

    expect(result.html).not.toContain("<b>Hacker</b>");
  });
});
