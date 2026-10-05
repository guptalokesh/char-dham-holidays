import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/db";
import {
  getPackageById,
  getPackageBySlug,
  listPackages,
  parseSteps,
  setPackageItinerary,
  updatePackage,
} from "@/lib/packages";

async function makePackage(slug: string, order: number, overrides: Record<string, unknown> = {}) {
  return prisma.chardhamPackage.create({
    data: { slug, name: slug.toUpperCase(), order, price: 21000, ...overrides },
  });
}

describe("packages module", () => {
  beforeEach(async () => {
    await prisma.enquiry.deleteMany();
    await prisma.media.deleteMany();
    await prisma.chardhamPackage.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("lists active packages in display order by default", async () => {
    await makePackage("second", 2);
    await makePackage("first", 1);
    await makePackage("hidden", 0, { active: false });

    expect((await listPackages()).map((p) => p.slug)).toEqual(["first", "second"]);
    expect((await listPackages({ activeOnly: false })).map((p) => p.slug)).toEqual([
      "hidden",
      "first",
      "second",
    ]);
  });

  it("finds a package by slug or id with images oldest-first, and returns null when unknown", async () => {
    const pkg = await makePackage("char-dham", 1);
    const base = Date.now();
    for (const [name, offset] of [["b", 1], ["a", 0]] as const) {
      await prisma.media.create({
        data: {
          url: `/uploads/${name}.jpg`,
          filename: `${name}.jpg`,
          mimeType: "image/jpeg",
          size: 1,
          purpose: "IMAGE",
          chardhamPackageId: pkg.id,
          createdAt: new Date(base + offset * 1000),
        },
      });
    }

    const urls = ["/uploads/a.jpg", "/uploads/b.jpg"];
    expect((await getPackageBySlug("char-dham"))?.images.map((i) => i.url)).toEqual(urls);
    expect((await getPackageById(pkg.id))?.images.map((i) => i.url)).toEqual(urls);
    expect(await getPackageBySlug("nope")).toBeNull();
  });

  it("allows a package with no price (price on request)", async () => {
    const pkg = await prisma.chardhamPackage.create({
      data: { slug: "any-dham", name: "Any Dham", order: 2 },
    });
    expect(pkg.price).toBeNull();
    expect(pkg.stayInfo).toBe("");
  });

  describe("updatePackage", () => {
    it("clears the price with null and leaves it alone when omitted", async () => {
      const pkg = await makePackage("char-dham", 1);

      expect((await updatePackage(pkg.id, { tagline: "All four dhams" })).price).toBe(21000);
      expect((await updatePackage(pkg.id, { price: null })).price).toBeNull();
      expect((await updatePackage(pkg.id, { price: 25000 })).price).toBe(25000);
    });

    it("saves ordered steps, inclusions and start details", async () => {
      const pkg = await makePackage("char-dham", 1);

      const updated = await updatePackage(pkg.id, {
        startPoint: "  Sahastradhara Helipad, Dehradun  ",
        howItStarts: "We meet you at the helipad.",
        inclusions: ["Helicopter flights", "Guided darshan"],
        steps: [
          { title: "Arrive in Dehradun", description: "Welcome and briefing.", featured: false },
          { title: "Kedarnath", description: "Shuttle flight and darshan.", featured: true, imageUrl: "/seed-images/k.jpg" },
        ],
      });

      expect(updated.startPoint).toBe("Sahastradhara Helipad, Dehradun");
      expect(updated.inclusions).toEqual(["Helicopter flights", "Guided darshan"]);
      expect(parseSteps(updated.steps).map((s) => s.title)).toEqual(["Arrive in Dehradun", "Kedarnath"]);
      expect(parseSteps(updated.steps)[1]).toMatchObject({ featured: true, imageUrl: "/seed-images/k.jpg" });
    });

    it("rejects a step without a title and ignores unknown keys such as slug", async () => {
      const pkg = await makePackage("char-dham", 1);

      await expect(
        updatePackage(pkg.id, { steps: [{ title: " ", description: "x", featured: false }] })
      ).rejects.toThrow();

      await updatePackage(pkg.id, { slug: "hacked", dhamChoice: true, tagline: "ok" } as never);
      const after = await getPackageById(pkg.id);
      expect(after?.slug).toBe("char-dham");
      expect(after?.dhamChoice).toBe(false);
    });
  });

  describe("parseSteps", () => {
    it("returns an empty list for missing or malformed data", () => {
      expect(parseSteps(null)).toEqual([]);
      expect(parseSteps("nope")).toEqual([]);
      expect(parseSteps([{ nothing: true }])).toEqual([]);
    });
  });
});

describe("setPackageItinerary", () => {
  beforeEach(async () => {
    await prisma.enquiry.deleteMany();
    await prisma.media.deleteMany();
    await prisma.chardhamPackage.deleteMany();
  });

  it("links an uploaded PDF to the package, and rejects an image or an unknown package", async () => {
    const pkg = await makePackage("char-dham", 1);
    const pdf = await prisma.media.create({
      data: { url: "/uploads/i.pdf", filename: "i.pdf", mimeType: "application/pdf", size: 1, purpose: "PDF" },
    });
    const image = await prisma.media.create({
      data: { url: "/uploads/i.jpg", filename: "i.jpg", mimeType: "image/jpeg", size: 1, purpose: "IMAGE" },
    });

    expect((await setPackageItinerary(pkg.id, pdf.id)).itineraryMedia?.url).toBe("/uploads/i.pdf");
    expect((await setPackageItinerary(pkg.id, null)).itineraryMediaId).toBeNull();
    await expect(setPackageItinerary(pkg.id, image.id)).rejects.toThrow(/PDF/);
    await expect(setPackageItinerary("missing", pdf.id)).rejects.toThrow();
  });
});
