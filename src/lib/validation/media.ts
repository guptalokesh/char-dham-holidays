import { z } from "zod";

export const mediaOwnerFields = [
  "chardhamPackageId",
  "trekId",
  "farmPropertyId",
  "roomId",
] as const;

export const mediaUploadFormSchema = z
  .object({
    purpose: z.enum(["IMAGE", "PDF"]),
    chardhamPackageId: z.string().min(1).optional(),
    trekId: z.string().min(1).optional(),
    farmPropertyId: z.string().min(1).optional(),
    roomId: z.string().min(1).optional(),
  })
  .refine(
    (data) => mediaOwnerFields.filter((field) => data[field] !== undefined).length <= 1,
    { message: "Provide at most one owner reference." }
  );

export type MediaUploadFormInput = z.infer<typeof mediaUploadFormSchema>;
