import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/db";
import {
  createRoom,
  getFarmProperty,
  getRoomAvailabilityGrid,
  searchAvailableRooms,
  setRoomAvailability,
  submitFarmBookingRequest,
  updateFarmProperty,
  updateRoom,
} from "@/lib/farm";
import { formatDateOnly, todayDateOnly } from "@/lib/date-utils";
import { updateWebsiteSettings } from "@/lib/settings";
import { FARM_PROPERTY_ID } from "@/lib/constants";

function futureDate(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().slice(0, 10);
}

async function makeRoom(overrides: { name?: string; price?: number; capacity?: number } = {}) {
  return createRoom({
    name: overrides.name ?? "Deluxe Room",
    price: overrides.price ?? 3500,
    capacity: overrides.capacity ?? 2,
  });
}

describe("farm home stay module", () => {
  beforeEach(async () => {
    await prisma.enquiry.deleteMany();
    await prisma.roomAvailability.deleteMany();
    await prisma.room.deleteMany();
    await prisma.media.deleteMany();
    await prisma.farmProperty.deleteMany();
    await prisma.websiteSettings.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("creates the singleton property row on first read", async () => {
    const property = await getFarmProperty();
    expect(property.id).toBe(FARM_PROPERTY_ID);
    expect(property.active).toBe(true);
  });

  it("round-trips a property update", async () => {
    await updateFarmProperty({ description: "Peaceful farm stay in the hills." });
    expect((await getFarmProperty()).description).toBe("Peaceful farm stay in the hills.");
  });

  describe("searchAvailableRooms", () => {
    it("returns a room with no availability records at all (open by default)", async () => {
      const room = await makeRoom();
      const results = await searchAvailableRooms({
        checkIn: futureDate(10),
        checkOut: futureDate(12),
        guests: 2,
      });
      expect(results.map((r) => r.id)).toContain(room.id);
    });

    it("excludes a room with capacity below the requested guest count", async () => {
      await makeRoom({ capacity: 2 });
      const results = await searchAvailableRooms({
        checkIn: futureDate(10),
        checkOut: futureDate(12),
        guests: 3,
      });
      expect(results).toHaveLength(0);
    });

    it("excludes an inactive room even if all nights are open", async () => {
      const room = await makeRoom();
      await updateRoom(room.id, { active: false });
      const results = await searchAvailableRooms({
        checkIn: futureDate(10),
        checkOut: futureDate(12),
        guests: 2,
      });
      expect(results).toHaveLength(0);
    });

    it("excludes a room when any single night in the range is booked (partial overlap)", async () => {
      const room = await makeRoom();
      const checkIn = futureDate(10);
      const checkOut = futureDate(13); // nights: +10, +11, +12
      await setRoomAvailability({
        roomId: room.id,
        dates: [futureDate(11)],
        status: "BOOKED",
      });

      const results = await searchAvailableRooms({ checkIn, checkOut, guests: 2 });
      expect(results.map((r) => r.id)).not.toContain(room.id);
    });

    it("excludes a room when a night is marked unavailable (not just booked)", async () => {
      const room = await makeRoom();
      await setRoomAvailability({
        roomId: room.id,
        dates: [futureDate(10)],
        status: "UNAVAILABLE",
      });

      const results = await searchAvailableRooms({
        checkIn: futureDate(10),
        checkOut: futureDate(12),
        guests: 2,
      });
      expect(results.map((r) => r.id)).not.toContain(room.id);
    });

    it("does NOT block the room when only the check-out date itself is booked (departure morning)", async () => {
      const room = await makeRoom();
      const checkIn = futureDate(10);
      const checkOut = futureDate(12);
      // The checkout date is not a night of this stay, so a booking that
      // starts that day (a same-day turnover) must not exclude this room.
      await setRoomAvailability({ roomId: room.id, dates: [checkOut], status: "BOOKED" });

      const results = await searchAvailableRooms({ checkIn, checkOut, guests: 2 });
      expect(results.map((r) => r.id)).toContain(room.id);
    });

    it("returns no results when no room satisfies the search", async () => {
      const room = await makeRoom();
      await setRoomAvailability({
        roomId: room.id,
        dates: [futureDate(10)],
        status: "BOOKED",
      });
      const results = await searchAvailableRooms({
        checkIn: futureDate(10),
        checkOut: futureDate(12),
        guests: 2,
      });
      expect(results).toEqual([]);
    });

    it("is unaffected by duplicate/repeated availability records for the same date (upsert, not stacked rows)", async () => {
      const room = await makeRoom();
      await setRoomAvailability({ roomId: room.id, dates: [futureDate(10)], status: "BOOKED" });
      await setRoomAvailability({ roomId: room.id, dates: [futureDate(10)], status: "BOOKED" });

      expect(
        await prisma.roomAvailability.count({ where: { roomId: room.id } })
      ).toBe(1);
    });

    it("reflects a stale AVAILABLE record being overwritten to BOOKED", async () => {
      const room = await makeRoom();
      await setRoomAvailability({ roomId: room.id, dates: [futureDate(10)], status: "AVAILABLE" });
      let results = await searchAvailableRooms({
        checkIn: futureDate(10),
        checkOut: futureDate(11),
        guests: 2,
      });
      expect(results.map((r) => r.id)).toContain(room.id);

      await setRoomAvailability({ roomId: room.id, dates: [futureDate(10)], status: "BOOKED" });
      results = await searchAvailableRooms({
        checkIn: futureDate(10),
        checkOut: futureDate(11),
        guests: 2,
      });
      expect(results.map((r) => r.id)).not.toContain(room.id);
    });

    it("rejects an invalid search (checkout before checkin, past date)", async () => {
      await expect(
        searchAvailableRooms({ checkIn: futureDate(5), checkOut: futureDate(3), guests: 1 })
      ).rejects.toThrow();
      await expect(
        searchAvailableRooms({ checkIn: futureDate(-1), checkOut: futureDate(2), guests: 1 })
      ).rejects.toThrow();
    });
  });

  describe("getRoomAvailabilityGrid", () => {
    it("defaults every day to AVAILABLE and reflects an explicit BOOKED override", async () => {
      const room = await makeRoom();
      await setRoomAvailability({ roomId: room.id, dates: [futureDate(2)], status: "BOOKED" });

      const grid = await getRoomAvailabilityGrid(5);
      const row = grid.find((r) => r.id === room.id)!;

      expect(row.days[0].date).toBe(formatDateOnly(todayDateOnly()));
      const bookedDay = row.days.find((d) => d.date === futureDate(2));
      expect(bookedDay?.status).toBe("BOOKED");
      const otherDay = row.days.find((d) => d.date === futureDate(1));
      expect(otherDay?.status).toBe("AVAILABLE");
    });
  });

  describe("submitFarmBookingRequest", () => {
    it("saves an enquiry linked to the room and returns a WhatsApp URL", async () => {
      const room = await makeRoom({ name: "Deluxe Room" });
      await updateWebsiteSettings({ whatsappNumber: "+91 90000 00000" });

      const result = await submitFarmBookingRequest({
        roomId: room.id,
        name: "Sana Iqbal",
        phone: "+91 98765 43210",
        checkIn: futureDate(10),
        checkOut: futureDate(12),
        guests: 2,
      });

      expect(result.whatsappUrl).toMatch(/^https:\/\/wa\.me\/919000000000\?text=/);
      expect(decodeURIComponent(result.whatsappUrl!)).toContain("Deluxe Room");

      const enquiry = await prisma.enquiry.findFirstOrThrow({
        where: { service: "FARM_HOME_STAY" },
      });
      expect(enquiry.roomId).toBe(room.id);
      expect(enquiry.details).toMatchObject({ guests: 2 });
    });

    it("does not silently succeed for a room that no longer satisfies the search (e.g. now inactive)", async () => {
      const room = await makeRoom();
      await updateRoom(room.id, { active: false });

      await expect(
        submitFarmBookingRequest({
          roomId: room.id,
          name: "Sana Iqbal",
          phone: "+91 98765 43210",
          checkIn: futureDate(10),
          checkOut: futureDate(12),
          guests: 2,
        })
      ).rejects.toThrow();
    });

    it("handles a duplicate/repeated submission without crashing", async () => {
      const room = await makeRoom();
      const payload = {
        roomId: room.id,
        name: "Sana Iqbal",
        phone: "+91 98765 43210",
        checkIn: futureDate(10),
        checkOut: futureDate(12),
        guests: 2,
      };

      await submitFarmBookingRequest(payload);
      await submitFarmBookingRequest(payload);

      expect(
        await prisma.enquiry.count({ where: { service: "FARM_HOME_STAY", roomId: room.id } })
      ).toBe(2);
    });
  });
});
