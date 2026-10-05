import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/db";
import { submitChardhamAvailabilityRequest } from "@/lib/chardham";
import { updateWebsiteSettings } from "@/lib/settings";

function futureDate(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().slice(0, 10);
}

describe("chardham module", () => {
  beforeEach(async () => {
    await prisma.enquiry.deleteMany();
    await prisma.media.deleteMany();
    await prisma.chardhamPackage.deleteMany();
    await prisma.websiteSettings.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("submitChardhamAvailabilityRequest", () => {
    beforeEach(async () => {
      await prisma.chardhamPackage.create({
        data: { slug: "char-dham", name: "Char Dham Yatra by Helicopter", order: 1, price: 21000 },
      });
    });

    const validInput = {
      name: "Anita Rao",
      phone: "+91 98765 43210",
      preferredDate: futureDate(15),
      travellers: 2,
    };

    it("saves an enquiry and returns a WhatsApp URL when a number is configured", async () => {
      await updateWebsiteSettings({ whatsappNumber: "+91 90000 00000" });

      const result = await submitChardhamAvailabilityRequest(validInput);

      expect(result.whatsappUrl).toMatch(/^https:\/\/wa\.me\/919000000000\?text=/);

      const enquiry = await prisma.enquiry.findFirstOrThrow({
        where: { service: "CHARDHAM" },
      });
      expect(enquiry.name).toBe("Anita Rao");
      expect(enquiry.phone).toBe("+91 98765 43210");
      expect(enquiry.details).toMatchObject({
        preferredDate: validInput.preferredDate,
        travellers: 2,
      });
    });

    it("still saves the enquiry but returns no WhatsApp URL when unconfigured", async () => {
      const result = await submitChardhamAvailabilityRequest(validInput);

      expect(result.whatsappUrl).toBeNull();
      expect(await prisma.enquiry.count({ where: { service: "CHARDHAM" } })).toBe(1);
    });

    it("rejects a past preferred date and saves nothing", async () => {
      await expect(
        submitChardhamAvailabilityRequest({ ...validInput, preferredDate: futureDate(-2) })
      ).rejects.toThrow();

      expect(await prisma.enquiry.count()).toBe(0);
    });
  });

  describe("per-package availability requests", () => {
    const base = {
      name: "Anita Rao",
      phone: "+91 98765 43210",
      preferredDate: futureDate(15),
      travellers: 2,
    };

    beforeEach(async () => {
      await updateWebsiteSettings({ whatsappNumber: "+91 90000 00000" });
      await prisma.chardhamPackage.create({
        data: { slug: "any-dham", name: "Any Dham Yatra by Helicopter", order: 2, dhamChoice: true },
      });
    });

    it("links the enquiry to the package and uses its name in the WhatsApp text", async () => {
      const result = await submitChardhamAvailabilityRequest({
        ...base,
        packageSlug: "any-dham",
        dhams: ["Kedarnath"],
      });

      const enquiry = await prisma.enquiry.findFirstOrThrow({ where: { service: "CHARDHAM" } });
      const pkg = await prisma.chardhamPackage.findUniqueOrThrow({ where: { slug: "any-dham" } });
      expect(enquiry.chardhamPackageId).toBe(pkg.id);
      expect(enquiry.details).toMatchObject({
        packageName: "Any Dham Yatra by Helicopter",
        dhams: ["Kedarnath"],
      });

      const text = decodeURIComponent(result.whatsappUrl!.split("text=")[1]);
      expect(text).toContain("Any Dham Yatra by Helicopter");
      expect(text).toContain("Dhams: Kedarnath");
    });

    it("requires at least one dham for a package where the dhams are chosen", async () => {
      await expect(
        submitChardhamAvailabilityRequest({ ...base, packageSlug: "any-dham" })
      ).rejects.toThrow(/dham/i);
      expect(await prisma.enquiry.count()).toBe(0);
    });

    it("rejects an unknown or inactive package", async () => {
      await expect(
        submitChardhamAvailabilityRequest({ ...base, packageSlug: "nope" })
      ).rejects.toThrow(/not found/i);

      await prisma.chardhamPackage.update({ where: { slug: "any-dham" }, data: { active: false } });
      await expect(
        submitChardhamAvailabilityRequest({ ...base, packageSlug: "any-dham", dhams: ["Kedarnath"] })
      ).rejects.toThrow(/not found/i);
    });
  });
});
