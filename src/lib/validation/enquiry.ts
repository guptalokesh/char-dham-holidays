import { z } from "zod";
import { nameSchema, phoneSchema } from "@/lib/validation/shared";

export const generalEnquirySchema = z
  .object({
    name: nameSchema,
    phone: phoneSchema,
    email: z.email("Enter a valid email address"),
    service: z.enum(["GENERAL", "CHARDHAM", "TREKKING", "FARM_HOME_STAY"]),
    trekId: z.string().optional(),
    message: z.string().trim().min(1, "Message is required").max(2000),
  })
  .refine((data) => data.service !== "TREKKING" || !!data.trekId, {
    message: "Please select a trek",
    path: ["trekId"],
  });

export type GeneralEnquiryInput = z.infer<typeof generalEnquirySchema>;
