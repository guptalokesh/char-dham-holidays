import { z } from "zod";
import { emptyToNull, futureDateSchema, nameSchema, phoneSchema } from "@/lib/validation/shared";

const optionalText = (maxLength: number) =>
  z.preprocess(emptyToNull, z.string().trim().max(maxLength).nullable().optional());

export const packageStepSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(1500).default(""),
  featured: z.boolean().default(false),
  imageUrl: z
    .string()
    .trim()
    .max(500)
    .regex(/^(\/|https:\/\/)/, "Image must be a site path or an https URL")
    .optional(),
});

export type PackageStep = z.infer<typeof packageStepSchema>;

export const chardhamPackageUpdateSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  price: z.number().int().positive().nullable().optional(),
  tagline: optionalText(200),
  startPoint: optionalText(300),
  howItStarts: optionalText(2000),
  inclusions: z.array(z.string().trim().min(1).max(200)).max(30).optional(),
  steps: z.array(packageStepSchema).max(30).optional(),
  destinations: z.array(z.string().trim().min(1).max(100)).optional(),
  stayInfo: z.string().trim().max(500).optional(),
  foodInfo: z.string().trim().max(500).optional(),
  travelInfo: z.string().trim().max(500).optional(),
  travelPeriod: optionalText(300),
  routeOverview: optionalText(2000),
  importantInfo: optionalText(2000),
  aircraftHandlingInfo: optionalText(2000),
  active: z.boolean().optional(),
});

export type ChardhamPackageUpdateInput = z.infer<typeof chardhamPackageUpdateSchema>;

const MAX_TRAVELLERS = 50;

export const DHAM_NAMES = ["Yamunotri", "Gangotri", "Kedarnath", "Badrinath"] as const;

export const chardhamAvailabilityRequestSchema = z.object({
  packageSlug: z.string().trim().min(1).default("char-dham"),
  dhams: z.array(z.enum(DHAM_NAMES)).max(4).optional(),
  name: nameSchema,
  phone: phoneSchema,
  preferredDate: futureDateSchema,
  travellers: z
    .number()
    .int()
    .min(1, "At least 1 traveller is required")
    .max(MAX_TRAVELLERS, "For groups larger than 50, please contact us directly."),
});

export type ChardhamAvailabilityRequestInput = z.input<
  typeof chardhamAvailabilityRequestSchema
>;
