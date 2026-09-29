import { z } from "zod";
import { emptyToNull, nameSchema, phoneSchema } from "@/lib/validation/shared";
import { parseDateOnly, todayDateOnly } from "@/lib/date-utils";

const optionalText = (maxLength: number) =>
  z.preprocess(emptyToNull, z.string().trim().max(maxLength).nullable().optional());

export const farmPropertyUpdateSchema = z.object({
  description: z.string().trim().min(1).max(2000).optional(),
  location: optionalText(300),
  mapLink: z.preprocess(emptyToNull, z.url("Enter a valid URL").nullable().optional()),
  guestCapacityNote: optionalText(300),
  active: z.boolean().optional(),
});

export type FarmPropertyUpdateInput = z.infer<typeof farmPropertyUpdateSchema>;

export const roomCreateSchema = z.object({
  name: z.string().trim().min(1).max(200),
  price: z.number().int().positive(),
  capacity: z.number().int().min(1).max(50),
  amenities: z.array(z.string().trim().min(1).max(100)).optional(),
});

export type RoomCreateInput = z.infer<typeof roomCreateSchema>;

export const roomUpdateSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  price: z.number().int().positive().optional(),
  capacity: z.number().int().min(1).max(50).optional(),
  amenities: z.array(z.string().trim().min(1).max(100)).optional(),
  active: z.boolean().optional(),
});

export type RoomUpdateInput = z.infer<typeof roomUpdateSchema>;

function isPastCalendarDate(value: string): boolean {
  return parseDateOnly(value).getTime() < todayDateOnly().getTime();
}

const dateStringSchema = z
  .string()
  .refine((value) => !Number.isNaN(new Date(value).getTime()), "Enter a valid date");

const MAX_GUESTS = 20;

export const farmSearchSchema = z
  .object({
    checkIn: dateStringSchema.refine((v) => !isPastCalendarDate(v), "Check-in cannot be in the past"),
    checkOut: dateStringSchema,
    guests: z.number().int().min(1, "At least 1 guest is required").max(MAX_GUESTS),
  })
  .refine((data) => new Date(data.checkOut) > new Date(data.checkIn), {
    message: "Check-out must be after check-in",
    path: ["checkOut"],
  });

export type FarmSearchInput = z.infer<typeof farmSearchSchema>;

export const farmBookingRequestSchema = farmSearchSchema.and(
  z.object({
    roomId: z.string().min(1, "A room must be selected"),
    name: nameSchema,
    phone: phoneSchema,
  })
);

export type FarmBookingRequestInput = z.infer<typeof farmBookingRequestSchema>;

export const roomAvailabilityBulkSchema = z.object({
  roomId: z.string().min(1),
  dates: z.array(dateStringSchema).min(1),
  status: z.enum(["AVAILABLE", "BOOKED", "UNAVAILABLE"]),
});

export type RoomAvailabilityBulkInput = z.infer<typeof roomAvailabilityBulkSchema>;
