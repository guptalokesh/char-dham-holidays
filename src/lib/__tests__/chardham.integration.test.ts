import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/db";
import {
  getChardhamPackage,
  setChardhamItinerary,
  submitChardhamAvailabilityRequest,
  updateChardhamPackage,
} from "@/lib/chardham";
import { updateWebsiteSettings } from "@/lib/settings";
import { CHARDHAM_PACKAGE_ID } from "@/lib/constants";

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

  it("creates the singleton row on first read", async () => {
    const pkg = await getChardhamPackage();
    expect(pkg.id).toBe(CHARDHAM_PACKAGE_ID);
    expect(pkg.active).toBe(true);
    expect(pkg.images).toEqual([]);
  });

  it("round-trips an update", async () => {
    await updateChardhamPackage({
      price: 210000,
      destinations: ["Yamunotri", "Gangotri", "Sri Kedarnath", "Badrinath"],
    });

    const pkg = await getChardhamPackage();
    expect(pkg.price).toBe(210000);
    expect(pkg.destinations).toEqual([
      "Yamunotri",
      "Gangotri",
      "Sri Kedarnath",
      "Badrinath",
    ]);
  });

  it("rejects an invalid update", async () => {
    await expect(updateChardhamPackage({ price: -1 })).rejects.toThrow();
  });

  describe("setChardhamItinerary", () => {
    it("links an uploaded PDF as the itinerary", async () => {
      const media = await prisma.media.create({
        data: {
          url: "/uploads/itinerary.pdf",
          filename: "itinerary.pdf",
          mimeType: "application/pdf",
          size: 1024,
          purpose: "PDF",
        },
      });

      const pkg = await setChardhamItinerary(media.id);
      expect(pkg.itineraryMediaId).toBe(media.id);
      expect(pkg.itineraryMedia?.url).toBe("/uploads/itinerary.pdf");
    });

    it("rejects a non-PDF media reference", async () => {
      const media = await prisma.media.create({
        data: {
          url: "/uploads/photo.jpg",
          filename: "photo.jpg",
          mimeType: "image/jpeg",
          size: 1024,
          purpose: "IMAGE",
        },
      });

      await expect(setChardhamItinerary(media.id)).rejects.toThrow();
    });

    it("clears the itinerary when given null", async () => {
      const media = await prisma.media.create({
        data: {
          url: "/uploads/itinerary.pdf",
          filename: "itinerary.pdf",
          mimeType: "application/pdf",
          size: 1024,
          purpose: "PDF",
        },
      });
      await setChardhamItinerary(media.id);

      const pkg = await setChardhamItinerary(null);
      expect(pkg.itineraryMediaId).toBeNull();
    });
  });

  describe("submitChardhamAvailabilityRequest", () => {
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
});
