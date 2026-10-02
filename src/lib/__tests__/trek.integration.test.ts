import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/db";
import {
  createTrek,
  getTrekById,
  getTrekBySlug,
  listTreks,
  setTrekItinerary,
  submitTrekRequest,
  updateTrek,
} from "@/lib/trek";
import { updateWebsiteSettings } from "@/lib/settings";

function futureDate(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().slice(0, 10);
}

describe("trek module", () => {
  beforeEach(async () => {
    await prisma.enquiry.deleteMany();
    await prisma.media.deleteMany();
    await prisma.trek.deleteMany();
    await prisma.websiteSettings.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("createTrek", () => {
    it("auto-generates a unique slug from the name", async () => {
      const trek = await createTrek({ name: "Devrana Trek", description: "desc" });
      expect(trek.slug).toBe("devrana-trek");
    });

    it("appends a suffix when the generated slug already exists", async () => {
      await createTrek({ name: "Devrana Trek", description: "desc" });
      const second = await createTrek({ name: "Devrana Trek", description: "another" });
      expect(second.slug).not.toBe("devrana-trek");
      expect(second.slug).toMatch(/^devrana-trek-/);
    });

    it("defaults to active: true", async () => {
      const trek = await createTrek({ name: "New Trek", description: "desc" });
      expect(trek.active).toBe(true);
    });
  });

  describe("listTreks", () => {
    it("returns only active treks by default, ordered by 'order'", async () => {
      const b = await createTrek({ name: "B Trek", description: "d" });
      const a = await createTrek({ name: "A Trek", description: "d" });
      await updateTrek(b.id, { order: 1 });
      await updateTrek(a.id, { order: 0 });
      const inactive = await createTrek({ name: "Inactive Trek", description: "d" });
      await updateTrek(inactive.id, { active: false });

      const treks = await listTreks();
      expect(treks.map((t) => t.name)).toEqual(["A Trek", "B Trek"]);
    });

    it("includes inactive treks when activeOnly is false", async () => {
      const trek = await createTrek({ name: "Inactive Trek", description: "d" });
      await updateTrek(trek.id, { active: false });

      const all = await listTreks({ activeOnly: false });
      expect(all.some((t) => t.name === "Inactive Trek")).toBe(true);
    });
  });

  describe("getTrekBySlug", () => {
    it("returns the trek including inactive ones", async () => {
      const trek = await createTrek({ name: "Rupnyol Bugyal Trek", description: "d" });
      await updateTrek(trek.id, { active: false });

      const found = await getTrekBySlug(trek.slug);
      expect(found?.name).toBe("Rupnyol Bugyal Trek");
      expect(found?.active).toBe(false);
    });

    it("returns null for an unknown slug", async () => {
      expect(await getTrekBySlug("does-not-exist")).toBeNull();
    });
  });

  describe("image order", () => {
    async function trekWithImagesInsertedOutOfOrder() {
      const trek = await createTrek({ name: "Gallery Trek", description: "d" });
      const base = Date.now();
      for (const [name, offset] of [["third", 2], ["first", 0], ["second", 1]] as const) {
        await prisma.media.create({
          data: {
            url: `/uploads/${name}.jpg`,
            filename: `${name}.jpg`,
            mimeType: "image/jpeg",
            size: 1,
            purpose: "IMAGE",
            trekId: trek.id,
            createdAt: new Date(base + offset * 1000),
          },
        });
      }
      return trek;
    }

    const expected = ["/uploads/first.jpg", "/uploads/second.jpg", "/uploads/third.jpg"];

    it("returns images oldest-first from getTrekBySlug so the hero is stable", async () => {
      const trek = await trekWithImagesInsertedOutOfOrder();
      expect((await getTrekBySlug(trek.slug))?.images.map((i) => i.url)).toEqual(expected);
    });

    it("returns images oldest-first from getTrekById and listTreks", async () => {
      const trek = await trekWithImagesInsertedOutOfOrder();
      expect((await getTrekById(trek.id))?.images.map((i) => i.url)).toEqual(expected);
      expect((await listTreks())[0].images.map((i) => i.url)).toEqual(expected);
    });
  });

  describe("getTrekById", () => {
    it("returns the trek by id", async () => {
      const trek = await createTrek({ name: "Devrana Trek", description: "d" });
      expect((await getTrekById(trek.id))?.name).toBe("Devrana Trek");
    });

    it("returns null for an unknown id", async () => {
      expect(await getTrekById("does-not-exist")).toBeNull();
    });
  });

  describe("setTrekItinerary", () => {
    it("links an uploaded PDF and rejects a non-PDF", async () => {
      const trek = await createTrek({ name: "Devrana Trek", description: "d" });
      const pdf = await prisma.media.create({
        data: {
          url: "/uploads/itinerary.pdf",
          filename: "itinerary.pdf",
          mimeType: "application/pdf",
          size: 10,
          purpose: "PDF",
        },
      });
      const image = await prisma.media.create({
        data: {
          url: "/uploads/photo.jpg",
          filename: "photo.jpg",
          mimeType: "image/jpeg",
          size: 10,
          purpose: "IMAGE",
        },
      });

      const updated = await setTrekItinerary(trek.id, pdf.id);
      expect(updated.itineraryMediaId).toBe(pdf.id);

      await expect(setTrekItinerary(trek.id, image.id)).rejects.toThrow();
    });
  });

  describe("submitTrekRequest", () => {
    it("saves an enquiry linked to the trek and returns a WhatsApp URL", async () => {
      const trek = await createTrek({ name: "Devrana Trek", description: "d" });
      await updateWebsiteSettings({ whatsappNumber: "+91 90000 00000" });

      const result = await submitTrekRequest(trek.id, {
        name: "Kunal Mehta",
        phone: "+91 98765 43210",
        people: 3,
        preferredDate: futureDate(20),
        requirements: "Vegetarian food",
      });

      expect(result.whatsappUrl).toMatch(/^https:\/\/wa\.me\/919000000000\?text=/);
      expect(decodeURIComponent(result.whatsappUrl!)).toContain("Devrana Trek");

      const enquiry = await prisma.enquiry.findFirstOrThrow({
        where: { service: "TREKKING" },
      });
      expect(enquiry.trekId).toBe(trek.id);
      expect(enquiry.details).toMatchObject({ people: 3, requirements: "Vegetarian food" });
    });

    it("rejects a request for a nonexistent trek", async () => {
      await expect(
        submitTrekRequest("does-not-exist", {
          name: "Kunal Mehta",
          phone: "+91 98765 43210",
          people: 1,
          preferredDate: futureDate(5),
        })
      ).rejects.toThrow();
    });
  });
});
