import { z } from "zod";
import { emptyToNull, futureDateSchema, nameSchema, phoneSchema } from "@/lib/validation/shared";

export const trekCreateSchema = z.object({
  name: z.string().trim().min(1).max(200),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]+$/, "Slug may only contain lowercase letters, numbers and hyphens")
    .optional(),
  description: z.string().trim().min(1).max(2000),
  price: z.number().int().positive().nullable().optional(),
});

export type TrekCreateInput = z.infer<typeof trekCreateSchema>;

export const trekUpdateSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().min(1).max(2000).optional(),
  price: z.preprocess(emptyToNull, z.number().int().positive().nullable().optional()),
  active: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
});

export type TrekUpdateInput = z.infer<typeof trekUpdateSchema>;

const MAX_PEOPLE = 50;

export const trekRequestSchema = z.object({
  name: nameSchema,
  phone: phoneSchema,
  people: z
    .number()
    .int()
    .min(1, "At least 1 person is required")
    .max(MAX_PEOPLE, "For groups larger than 50, please contact us directly."),
  preferredDate: futureDateSchema,
  requirements: z.string().trim().max(1000).optional(),
});

export type TrekRequestInput = z.infer<typeof trekRequestSchema>;
