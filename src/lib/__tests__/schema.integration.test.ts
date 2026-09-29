import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/db";

async function createFarmWithRoom() {
  const farm = await prisma.farmProperty.create({
    data: { description: "Test farm" },
  });
  const room = await prisma.room.create({
    data: {
      farmPropertyId: farm.id,
      name: "Test Room",
      price: 1000,
      capacity: 2,
    },
  });
  return { farm, room };
}

describe("Prisma schema constraints", () => {
  beforeEach(async () => {
    await prisma.enquiry.deleteMany();
    await prisma.roomAvailability.deleteMany();
    await prisma.room.deleteMany();
    await prisma.farmProperty.deleteMany();
    await prisma.media.deleteMany();
    await prisma.trek.deleteMany();
    await prisma.chardhamPackage.deleteMany();
    await prisma.adminUser.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("rejects a duplicate RoomAvailability for the same room and date", async () => {
    const { room } = await createFarmWithRoom();
    const date = new Date("2026-10-20");

    await prisma.roomAvailability.create({
      data: { roomId: room.id, date, status: "AVAILABLE" },
    });

    await expect(
      prisma.roomAvailability.create({
        data: { roomId: room.id, date, status: "BOOKED" },
      })
    ).rejects.toMatchObject({ code: "P2002" });
  });

  it("rejects a duplicate Trek slug", async () => {
    await prisma.trek.create({
      data: { slug: "devrana-trek", name: "Devrana Trek", description: "Test" },
    });

    await expect(
      prisma.trek.create({
        data: { slug: "devrana-trek", name: "Another Trek", description: "Test" },
      })
    ).rejects.toMatchObject({ code: "P2002" });
  });

  it("rejects a duplicate AdminUser email", async () => {
    await prisma.adminUser.create({
      data: { email: "admin@example.com", passwordHash: "hash" },
    });

    await expect(
      prisma.adminUser.create({
        data: { email: "admin@example.com", passwordHash: "hash2" },
      })
    ).rejects.toMatchObject({ code: "P2002" });
  });

  it("cascades deleting a Room to its RoomAvailability rows", async () => {
    const { room } = await createFarmWithRoom();
    await prisma.roomAvailability.create({
      data: { roomId: room.id, date: new Date("2026-11-01"), status: "AVAILABLE" },
    });

    await prisma.room.delete({ where: { id: room.id } });

    const remaining = await prisma.roomAvailability.findMany({
      where: { roomId: room.id },
    });
    expect(remaining).toHaveLength(0);
  });

  it("sets Enquiry.trekId to null when the referenced Trek is deleted", async () => {
    const trek = await prisma.trek.create({
      data: { slug: "rupnyol-bugyal-trek", name: "Rupnyol Bugyal Trek", description: "Test" },
    });
    const enquiry = await prisma.enquiry.create({
      data: {
        name: "Test Customer",
        phone: "+911234567890",
        service: "TREKKING",
        trekId: trek.id,
      },
    });

    await prisma.trek.delete({ where: { id: trek.id } });

    const updated = await prisma.enquiry.findUniqueOrThrow({
      where: { id: enquiry.id },
    });
    expect(updated.trekId).toBeNull();
  });
});
