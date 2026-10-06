import { describe, expect, it } from "vitest";
import { generalEnquirySchema } from "@/lib/validation/enquiry";

const valid = {
  name: "Meera Nair",
  phone: "+91 98765 43210",
  email: "meera@example.com",
  service: "GENERAL" as const,
  message: "I'd like to know more about your packages.",
};

describe("generalEnquirySchema", () => {
  it("accepts a valid general enquiry", () => {
    expect(generalEnquirySchema.safeParse(valid).success).toBe(true);
  });

  it("accepts a trekking enquiry with a trekId", () => {
    const result = generalEnquirySchema.safeParse({
      ...valid,
      service: "TREKKING",
      trekId: "trek-1",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a trekking enquiry without a trekId", () => {
    const result = generalEnquirySchema.safeParse({ ...valid, service: "TREKKING" });
    expect(result.success).toBe(false);
  });

  it("rejects a malformed email", () => {
    expect(
      generalEnquirySchema.safeParse({ ...valid, email: "not-an-email" }).success
    ).toBe(false);
  });

  it("rejects an empty message", () => {
    expect(generalEnquirySchema.safeParse({ ...valid, message: "" }).success).toBe(false);
  });

  it("rejects an invalid service value", () => {
    expect(
      generalEnquirySchema.safeParse({ ...valid, service: "NOT_A_SERVICE" }).success
    ).toBe(false);
  });

  it("accepts an enquiry with or without a WhatsApp number", () => {
    expect(generalEnquirySchema.safeParse({ ...valid, whatsapp: "+91 98765 43211" }).success).toBe(true);
    expect(generalEnquirySchema.safeParse({ ...valid, whatsapp: "" }).success).toBe(true);
  });

  it("rejects a malformed WhatsApp number", () => {
    expect(generalEnquirySchema.safeParse({ ...valid, whatsapp: "abc" }).success).toBe(false);
  });
});
