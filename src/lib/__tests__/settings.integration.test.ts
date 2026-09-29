import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/db";
import { getWebsiteSettings, updateWebsiteSettings } from "@/lib/settings";
import { WEBSITE_SETTINGS_ID } from "@/lib/constants";

describe("website settings", () => {
  beforeEach(async () => {
    await prisma.websiteSettings.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("creates the singleton row with sensible defaults on first read", async () => {
    const settings = await getWebsiteSettings();
    expect(settings.id).toBe(WEBSITE_SETTINGS_ID);
    expect(settings.businessName).toBe("Char Dham Holidays");
    expect(settings.primaryPhone).toBeNull();
    expect(settings.instagramUrl).toBeNull();

    expect(await prisma.websiteSettings.count()).toBe(1);
  });

  it("does not create a second row on a subsequent read", async () => {
    await getWebsiteSettings();
    await getWebsiteSettings();
    expect(await prisma.websiteSettings.count()).toBe(1);
  });

  it("round-trips an update through getWebsiteSettings", async () => {
    await updateWebsiteSettings({
      whatsappNumber: "+91 98765 43210",
      primaryEmail: "hello@chardhamholidays.example",
      instagramUrl: "https://instagram.com/chardhamholidays",
    });

    const settings = await getWebsiteSettings();
    expect(settings.whatsappNumber).toBe("+91 98765 43210");
    expect(settings.primaryEmail).toBe("hello@chardhamholidays.example");
    expect(settings.instagramUrl).toBe("https://instagram.com/chardhamholidays");
  });

  it("clears a field back to null when updated with an empty string", async () => {
    await updateWebsiteSettings({ secondaryPhone: "+91 90000 00000" });
    expect((await getWebsiteSettings()).secondaryPhone).toBe("+91 90000 00000");

    await updateWebsiteSettings({ secondaryPhone: "" });
    expect((await getWebsiteSettings()).secondaryPhone).toBeNull();
  });

  it("leaves other fields untouched when only one field is updated", async () => {
    await updateWebsiteSettings({ businessName: "Char Dham Holidays Pvt Ltd" });
    await updateWebsiteSettings({ primaryPhone: "+91 99999 99999" });

    const settings = await getWebsiteSettings();
    expect(settings.businessName).toBe("Char Dham Holidays Pvt Ltd");
    expect(settings.primaryPhone).toBe("+91 99999 99999");
  });

  it("rejects an update with invalid data and leaves existing settings unchanged", async () => {
    await updateWebsiteSettings({ whatsappNumber: "+91 98765 43210" });

    await expect(
      updateWebsiteSettings({ primaryEmail: "not-an-email" })
    ).rejects.toThrow();

    const settings = await getWebsiteSettings();
    expect(settings.whatsappNumber).toBe("+91 98765 43210");
    expect(settings.primaryEmail).toBeNull();
  });
});
