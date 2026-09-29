import { describe, expect, it } from "vitest";
import { websiteSettingsUpdateSchema } from "@/lib/validation/settings";

describe("websiteSettingsUpdateSchema", () => {
  it("accepts a fully valid partial update", () => {
    const result = websiteSettingsUpdateSchema.safeParse({
      businessName: "Char Dham Holidays",
      primaryEmail: "hello@example.com",
      whatsappNumber: "+91 98765 43210",
      mapLink: "https://maps.google.com/?q=chardham",
      instagramUrl: "https://instagram.com/chardhamholidays",
      primaryColor: "#1B4B66",
    });
    expect(result.success).toBe(true);
  });

  it("accepts an empty object (no fields to update)", () => {
    expect(websiteSettingsUpdateSchema.safeParse({}).success).toBe(true);
  });

  it("treats an empty string as clearing an optional field", () => {
    const result = websiteSettingsUpdateSchema.safeParse({
      secondaryPhone: "",
      mapLink: "",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.secondaryPhone).toBeNull();
      expect(result.data.mapLink).toBeNull();
    }
  });

  it("rejects a malformed email", () => {
    const result = websiteSettingsUpdateSchema.safeParse({
      primaryEmail: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a malformed phone number", () => {
    const result = websiteSettingsUpdateSchema.safeParse({
      whatsappNumber: "call me maybe",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a malformed URL", () => {
    const result = websiteSettingsUpdateSchema.safeParse({
      instagramUrl: "not a url",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid hex color", () => {
    const result = websiteSettingsUpdateSchema.safeParse({
      primaryColor: "blue",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an empty businessName", () => {
    const result = websiteSettingsUpdateSchema.safeParse({ businessName: "" });
    expect(result.success).toBe(false);
  });
});
