import { existsSync } from "node:fs";
import path from "node:path";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/db";
import { FARM_PROPERTY_ID } from "@/lib/constants";
import { parseSteps } from "@/lib/packages";
import { runSeed } from "../seed-logic";

describe("seed script", () => {
  beforeEach(async () => {
    await prisma.enquiry.deleteMany();
    await prisma.roomAvailability.deleteMany();
    await prisma.room.deleteMany();
    await prisma.farmProperty.deleteMany();
    await prisma.media.deleteMany();
    await prisma.place.deleteMany();
    await prisma.trek.deleteMany();
    await prisma.chardhamPackage.deleteMany();
    await prisma.websiteSettings.deleteMany();
    await prisma.adminUser.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("is idempotent — running twice does not create duplicates", async () => {
    await runSeed();
    await runSeed();

    expect(await prisma.adminUser.count()).toBe(1);
    expect(await prisma.websiteSettings.count()).toBe(1);
    expect(await prisma.chardhamPackage.count()).toBe(3);
    expect(await prisma.trek.count()).toBe(2);
    expect(await prisma.farmProperty.count()).toBe(1);
    expect(await prisma.room.count()).toBe(2);
    expect(await prisma.roomAvailability.count()).toBe(60);
    expect(await prisma.media.count()).toBe(24);
    expect(await prisma.place.count()).toBe(2);
  });

  it("seeds the single business phone and email, with no other contact details", async () => {
    await runSeed();

    const settings = await prisma.websiteSettings.findFirstOrThrow();
    expect(settings.primaryPhone).toBe("+91 8958405555");
    expect(settings.whatsappNumber).toBe("+91 8958405555");
    expect(settings.primaryEmail).toBe("Sanjaythapliyal02@gmail.com");
    expect(settings.enquiryEmail).toBe("Sanjaythapliyal02@gmail.com");
    expect(settings.secondaryPhone).toBeNull();
  });

  it("links the seeded logo as the website's logo media", async () => {
    await runSeed();

    const settings = await prisma.websiteSettings.findUniqueOrThrow({
      where: { id: (await prisma.websiteSettings.findFirstOrThrow()).id },
    });
    expect(settings.logoMediaId).not.toBeNull();
    const logoMedia = await prisma.media.findUnique({
      where: { id: settings.logoMediaId! },
    });
    expect(logoMedia?.url).toBe("/seed-images/logo.jpg");
  });

  it("seeds the two named treks as active by default", async () => {
    await runSeed();

    const slugs = (await prisma.trek.findMany({ select: { slug: true } }))
      .map((t) => t.slug)
      .sort();
    expect(slugs).toEqual(["devrana-trek", "rupnyol-bugyal-trek"]);

    const treks = await prisma.trek.findMany();
    expect(treks.every((t) => t.active)).toBe(true);
  });

  describe("helicopter yatra packages", () => {
    it("seeds Char Dham at 21,000, Any Dham and Handling on request, in display order", async () => {
      await runSeed();

      const pkgs = await prisma.chardhamPackage.findMany({ orderBy: { order: "asc" } });
      expect(pkgs.map((p) => [p.slug, p.price, p.dhamChoice])).toEqual([
        ["char-dham", 21000, false],
        ["any-dham", null, true],
        ["yamunotri-gangotri-handling", null, false],
      ]);
      expect(pkgs[0].name).toBe("Char Dham Yatra by Helicopter");
    });

    it("gives every package a start point, an ordered sequence and inclusions", async () => {
      await runSeed();

      for (const pkg of await prisma.chardhamPackage.findMany()) {
        const steps = parseSteps(pkg.steps);
        expect(pkg.startPoint, pkg.slug).toBeTruthy();
        expect(pkg.howItStarts, pkg.slug).toBeTruthy();
        expect(steps.length, pkg.slug).toBeGreaterThanOrEqual(4);
        expect(pkg.inclusions.length, pkg.slug).toBeGreaterThanOrEqual(3);
      }
    });

    it("marks the four dhams as featured steps of Char Dham, in pilgrimage order", async () => {
      await runSeed();

      const pkg = await prisma.chardhamPackage.findUniqueOrThrow({ where: { slug: "char-dham" } });
      const featured = parseSteps(pkg.steps).filter((s) => s.featured).map((s) => s.title);
      expect(featured).toEqual(["Yamunotri", "Gangotri", "Kedarnath", "Badrinath"]);
    });

    it("gives each dham step a photo that exists in public/seed-images", async () => {
      await runSeed();

      const pkg = await prisma.chardhamPackage.findUniqueOrThrow({ where: { slug: "char-dham" } });
      const images = parseSteps(pkg.steps).filter((s) => s.featured).map((s) => s.imageUrl);
      expect(images).toEqual([
        "/seed-images/dham-yamunotri.jpg",
        "/seed-images/dham-gangotri.jpg",
        "/seed-images/dham-kedarnath.jpg",
        "/seed-images/dham-badrinath.jpg",
      ]);
      for (const url of images) {
        expect(existsSync(path.join(process.cwd(), "public", url!)), url).toBe(true);
      }
    });

    it("keeps the Yamunotri and Gangotri handling service free of Kedarnath and Badrinath", async () => {
      await runSeed();

      const pkg = await prisma.chardhamPackage.findUniqueOrThrow({
        where: { slug: "yamunotri-gangotri-handling" },
      });
      const text = JSON.stringify([pkg.name, pkg.routeOverview, pkg.steps, pkg.inclusions]);
      expect(text).toMatch(/Yamunotri/);
      expect(text).toMatch(/Gangotri/);
      expect(text).not.toMatch(/Kedarnath|Badrinath/);
    });

    it("does not bring back steps an admin removed when the seed runs again", async () => {
      await runSeed();
      await prisma.chardhamPackage.update({ where: { slug: "any-dham" }, data: { steps: [] } });
      await prisma.chardhamPackage.update({ where: { slug: "char-dham" }, data: { tagline: "Edited" } });

      await runSeed();

      const any = await prisma.chardhamPackage.findUniqueOrThrow({ where: { slug: "any-dham" } });
      const char = await prisma.chardhamPackage.findUniqueOrThrow({ where: { slug: "char-dham" } });
      expect(parseSteps(any.steps)).toEqual([]);
      expect(char.tagline).toBe("Edited");
    });

    it("fills the content of an existing, empty Char Dham row without changing its price", async () => {
      await prisma.chardhamPackage.create({
        data: { id: "singleton-chardham-package", slug: "char-dham", name: "Char Dham Yatra by Helicopter", price: 25000 },
      });

      await runSeed();

      const pkg = await prisma.chardhamPackage.findUniqueOrThrow({ where: { slug: "char-dham" } });
      expect(pkg.price).toBe(25000);
      expect(parseSteps(pkg.steps).length).toBeGreaterThan(0);
      expect(pkg.startPoint).toBeTruthy();
    });
  });

  describe("gallery images", () => {
    async function urls(where: Record<string, unknown>) {
      const media = await prisma.media.findMany({ where, orderBy: { createdAt: "asc" } });
      return media.map((m) => m.url);
    }

    it("gives Devrana Trek its hero first, then temple and mela photos", async () => {
      await runSeed();
      const trek = await prisma.trek.findUniqueOrThrow({ where: { slug: "devrana-trek" } });

      expect(await urls({ trekId: trek.id })).toEqual([
        "/seed-images/devrana-trek-hero.jpg",
        "/seed-images/devrana-mandir-1.jpg",
        "/seed-images/devrana-mela-hero.jpg",
      ]);
    });

    it("gives Rupnyol Bugyal Trek its summit hero and three more views", async () => {
      await runSeed();
      const trek = await prisma.trek.findUniqueOrThrow({ where: { slug: "rupnyol-bugyal-trek" } });

      expect(await urls({ trekId: trek.id })).toEqual([
        "/seed-images/bugyal-summit.jpg",
        "/seed-images/bugyal-horses.jpg",
        "/seed-images/bugyal-valley.jpg",
        "/seed-images/bugyal-tree.jpg",
      ]);
    });

    it("gives the farm stay the hotel exterior and lounge, and rooms their own photos", async () => {
      await runSeed();

      expect(await urls({ farmPropertyId: FARM_PROPERTY_ID })).toEqual([
        "/seed-images/hotel-exterior.jpg",
        "/seed-images/hotel-lounge.jpg",
      ]);
      expect(await urls({ roomId: "singleton-room-deluxe" })).toEqual([
        "/seed-images/room-deluxe-1.jpg",
        "/seed-images/room-deluxe-2.jpg",
      ]);
      expect(await urls({ roomId: "singleton-room-cottage" })).toEqual([
        "/seed-images/room-twin.jpg",
      ]);
    });

    it("keeps gallery order stable when the seed is run again", async () => {
      await runSeed();
      await runSeed();
      const trek = await prisma.trek.findUniqueOrThrow({ where: { slug: "devrana-trek" } });

      expect((await urls({ trekId: trek.id }))[0]).toBe("/seed-images/devrana-trek-hero.jpg");
    });

    it("seeds the Devrana mandir and base camp places with their photos", async () => {
      await runSeed();

      const mandir = await prisma.place.findUniqueOrThrow({ where: { slug: "devrana-mandir" } });
      expect(mandir.title).toMatch(/Devrana/);
      expect(mandir.address).toBe("Devrana, Tiyan area, Uttarakhand");
      expect(`${mandir.address}${mandir.body}`).not.toMatch(/\d{6}/);
      expect(await urls({ placeId: mandir.id })).toEqual([
        "/seed-images/devrana-mela-hero.jpg",
        "/seed-images/devrana-mandir-1.jpg",
        "/seed-images/devrana-mandir-snow.jpg",
        "/seed-images/devrana-ridges.jpg",
      ]);

      const camp = await prisma.place.findUniqueOrThrow({ where: { slug: "dhari-kalogi-basecamp" } });
      expect(await urls({ placeId: camp.id })).toEqual([
        "/seed-images/basecamp-aerial.jpg",
        "/seed-images/basecamp-village.jpg",
        "/seed-images/basecamp-slope.jpg",
      ]);
    });
  });
});
