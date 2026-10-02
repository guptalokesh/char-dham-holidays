import { z } from "zod";
import { emptyToNull } from "@/lib/validation/shared";

export const placeUpdateSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  summary: z.string().trim().min(1).max(500).optional(),
  body: z.string().trim().min(1).max(5000).optional(),
  address: z.preprocess(emptyToNull, z.string().trim().max(300).nullable().optional()),
  mapLink: z.preprocess(emptyToNull, z.string().trim().url().max(500).nullable().optional()),
  active: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
});

export type PlaceUpdateInput = z.infer<typeof placeUpdateSchema>;
