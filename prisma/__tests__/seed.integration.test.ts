import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/db";
import { FARM_PROPERTY_ID } from "@/lib/constants";
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
    expect(await prisma.chardhamPackage.count()).toBe(1);
    expect(await prisma.trek.count()).toBe(2);
    expect(await prisma.farmProperty.count()).toBe(1);
    expect(await prisma.room.count()).toBe(2);
    expect(await prisma.roomAvailability.count()).toBe(60);
    expect(await prisma.media.count()).toBe(21);
    expect(await prisma.place.count()).toBe(2);
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

  it("seeds editable helicopter handling text for Yamunotri and Gangotri only", async () => {
    await runSeed();

    const pkg = await prisma.chardhamPackage.findFirstOrThrow();
    expect(pkg.aircraftHandlingInfo).toMatch(/Yamunotri/);
    expect(pkg.aircraftHandlingInfo).toMatch(/Gangotri/);
    expect(pkg.aircraftHandlingInfo).not.toMatch(/Kedarnath|Badrinath/);
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
