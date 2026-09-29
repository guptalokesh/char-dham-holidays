import { z } from "zod";

export const enquiryStatusUpdateSchema = z.object({
  status: z.enum(["NEW", "CONTACTED", "CLOSED"]),
});

export type EnquiryStatusUpdateInput = z.infer<typeof enquiryStatusUpdateSchema>;
