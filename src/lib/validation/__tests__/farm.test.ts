import { describe, expect, it } from "vitest";
import {
  farmBookingRequestSchema,
  farmSearchSchema,
  roomCreateSchema,
} from "@/lib/validation/farm";

function futureDate(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().slice(0, 10);
}

describe("farmSearchSchema", () => {
  const valid = { checkIn: futureDate(5), checkOut: futureDate(7), guests: 2 };

  it("accepts a valid search", () => {
    expect(farmSearchSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects check-out on or before check-in", () => {
    expect(
      farmSearchSchema.safeParse({ ...valid, checkOut: valid.checkIn }).success
    ).toBe(false);
    expect(
      farmSearchSchema.safeParse({ ...valid, checkOut: futureDate(3) }).success
    ).toBe(false);
  });

  it("rejects a past check-in date", () => {
    expect(
      farmSearchSchema.safeParse({ ...valid, checkIn: futureDate(-1) }).success
    ).toBe(false);
  });

  it("rejects zero or unreasonably large guest counts", () => {
    expect(farmSearchSchema.safeParse({ ...valid, guests: 0 }).success).toBe(false);
    expect(farmSearchSchema.safeParse({ ...valid, guests: 500 }).success).toBe(false);
  });

  it("rejects an invalid date string", () => {
    expect(
      farmSearchSchema.safeParse({ ...valid, checkIn: "not-a-date" }).success
    ).toBe(false);
  });
});

describe("farmBookingRequestSchema", () => {
  it("accepts a valid booking request", () => {
    const result = farmBookingRequestSchema.safeParse({
      roomId: "room-1",
      name: "Sana Iqbal",
      phone: "+91 98765 43210",
      checkIn: futureDate(5),
      checkOut: futureDate(7),
      guests: 2,
    });
    expect(result.success).toBe(true);
  });

  it("rejects a missing roomId", () => {
    const result = farmBookingRequestSchema.safeParse({
      name: "Sana Iqbal",
      phone: "+91 98765 43210",
      checkIn: futureDate(5),
      checkOut: futureDate(7),
      guests: 2,
    });
    expect(result.success).toBe(false);
  });
});

describe("roomCreateSchema", () => {
  it("accepts a valid room", () => {
    expect(
      roomCreateSchema.safeParse({ name: "Deluxe Room", price: 3500, capacity: 2 }).success
    ).toBe(true);
  });

  it("rejects zero capacity", () => {
    expect(
      roomCreateSchema.safeParse({ name: "Deluxe Room", price: 3500, capacity: 0 }).success
    ).toBe(false);
  });
});
