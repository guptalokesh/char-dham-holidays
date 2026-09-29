import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/db";
import { runSeed } from "../seed-logic";

describe("seed script", () => {
  beforeEach(async () => {
    await prisma.enquiry.deleteMany();
    await prisma.roomAvailability.deleteMany();
    await prisma.room.deleteMany();
    await prisma.farmProperty.deleteMany();
    await prisma.media.deleteMany();
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
    expect(await prisma.media.count()).toBe(4);
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
});
