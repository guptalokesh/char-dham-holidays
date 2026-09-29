import { z } from "zod";
import { parseDateOnly, todayDateOnly } from "@/lib/date-utils";

export const PHONE_REGEX = /^\+?[0-9 ()-]{7,20}$/;

export function emptyToNull(value: unknown) {
  return value === "" ? null : value;
}

export const nameSchema = z.string().trim().min(1, "Name is required").max(200);
export const phoneSchema = z
  .string()
  .trim()
  .regex(PHONE_REGEX, "Enter a valid phone number");

function isPastDate(value: string): boolean {
  return parseDateOnly(value).getTime() < todayDateOnly().getTime();
}

export const futureDateSchema = z
  .string()
  .refine((value) => !Number.isNaN(new Date(value).getTime()), "Enter a valid date")
  .refine((value) => !isPastDate(value), "Date cannot be in the past");
