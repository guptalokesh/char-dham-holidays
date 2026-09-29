import { prisma } from "@/lib/db";
import type { EnquiryStatus } from "@/generated/prisma/enums";
import { enquiryStatusUpdateSchema } from "@/lib/validation/enquiries-admin";

export async function listEnquiries(options?: { status?: EnquiryStatus }) {
  return prisma.enquiry.findMany({
    where: options?.status ? { status: options.status } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      trek: { select: { name: true } },
      room: { select: { name: true } },
    },
  });
}

export async function updateEnquiryStatus(id: string, status: EnquiryStatus) {
  const data = enquiryStatusUpdateSchema.parse({ status });
  return prisma.enquiry.update({ where: { id }, data: { status: data.status } });
}
