import { z } from "zod";
import { emptyToNull, futureDateSchema, nameSchema, phoneSchema } from "@/lib/validation/shared";

const optionalText = (maxLength: number) =>
  z.preprocess(emptyToNull, z.string().trim().max(maxLength).nullable().optional());

export const chardhamPackageUpdateSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  price: z.number().int().positive().optional(),
  destinations: z.array(z.string().trim().min(1).max(100)).min(1).optional(),
  stayInfo: z.string().trim().min(1).max(500).optional(),
  foodInfo: z.string().trim().min(1).max(500).optional(),
  travelInfo: z.string().trim().min(1).max(500).optional(),
  travelPeriod: optionalText(300),
  routeOverview: optionalText(2000),
  importantInfo: optionalText(2000),
  active: z.boolean().optional(),
});

export type ChardhamPackageUpdateInput = z.infer<typeof chardhamPackageUpdateSchema>;

const MAX_TRAVELLERS = 50;

export const chardhamAvailabilityRequestSchema = z.object({
  name: nameSchema,
  phone: phoneSchema,
  preferredDate: futureDateSchema,
  travellers: z
    .number()
    .int()
    .min(1, "At least 1 traveller is required")
    .max(MAX_TRAVELLERS, "For groups larger than 50, please contact us directly."),
});

export type ChardhamAvailabilityRequestInput = z.infer<
  typeof chardhamAvailabilityRequestSchema
>;
