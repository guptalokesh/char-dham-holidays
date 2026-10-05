import { prisma } from "@/lib/db";
import { UserFacingError } from "@/lib/errors";
import { getWebsiteSettings } from "@/lib/settings";
import {
  buildEnquiryAcknowledgementEmail,
  buildEnquiryNotificationEmail,
} from "@/lib/email/templates";
import { sendMail } from "@/lib/email/send";
import { generalEnquirySchema, type GeneralEnquiryInput } from "@/lib/validation/enquiry";

const FIXED_SERVICE_LABELS: Record<"FARM_HOME_STAY" | "GENERAL", string> = {
  FARM_HOME_STAY: "Farm Home Stay",
  GENERAL: "General Enquiry",
};

export interface EnquiryServiceOption {
  service: "GENERAL" | "CHARDHAM" | "TREKKING" | "FARM_HOME_STAY";
  trekId?: string;
  chardhamPackageId?: string;
  label: string;
}

export async function getEnquiryServiceOptions(): Promise<EnquiryServiceOption[]> {
  const activeTreks = await prisma.trek.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
    select: { id: true, name: true },
  });

  const activePackages = await prisma.chardhamPackage.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
    select: { id: true, name: true },
  });

  return [
    ...activePackages.map((pkg) => ({
      service: "CHARDHAM" as const,
      chardhamPackageId: pkg.id,
      label: pkg.name,
    })),
    ...activeTreks.map((trek) => ({
      service: "TREKKING" as const,
      trekId: trek.id,
      label: trek.name,
    })),
    { service: "FARM_HOME_STAY", label: FIXED_SERVICE_LABELS.FARM_HOME_STAY },
    { service: "GENERAL", label: FIXED_SERVICE_LABELS.GENERAL },
  ];
}

async function resolveServiceLabel(
  service: GeneralEnquiryInput["service"],
  trekId?: string,
  chardhamPackageId?: string
): Promise<string> {
  if (service === "CHARDHAM") {
    const pkg = await prisma.chardhamPackage.findUnique({ where: { id: chardhamPackageId } });
    if (!pkg) {
      throw new UserFacingError("Selected yatra was not found.");
    }
    return pkg.name;
  }
  if (service === "TREKKING") {
    const trek = await prisma.trek.findUnique({ where: { id: trekId } });
    if (!trek) {
      throw new UserFacingError("Selected trek was not found.");
    }
    return trek.name;
  }
  return FIXED_SERVICE_LABELS[service];
}

export interface SubmitEnquiryResult {
  enquiryId: string;
}

export async function submitGeneralEnquiry(
  input: GeneralEnquiryInput
): Promise<SubmitEnquiryResult> {
  const data = generalEnquirySchema.parse(input);
  const serviceLabel = await resolveServiceLabel(data.service, data.trekId, data.chardhamPackageId);

  const enquiry = await prisma.enquiry.create({
    data: {
      name: data.name,
      phone: data.phone,
      email: data.email,
      service: data.service,
      trekId: data.service === "TREKKING" ? data.trekId : undefined,
      chardhamPackageId: data.service === "CHARDHAM" ? data.chardhamPackageId : undefined,
      message: data.message,
    },
  });

  const settings = await getWebsiteSettings();
  const notifyTo = settings.enquiryEmail ?? settings.primaryEmail;

  if (notifyTo) {
    try {
      const notification = buildEnquiryNotificationEmail({
        name: data.name,
        phone: data.phone,
        email: data.email,
        service: serviceLabel,
        message: data.message,
        businessName: settings.businessName,
      });
      await sendMail({ to: notifyTo, ...notification, replyTo: data.email });
    } catch (error) {
      console.error("Failed to send enquiry notification email:", error);
    }
  }

  try {
    const acknowledgement = buildEnquiryAcknowledgementEmail({
      name: data.name,
      phone: data.phone,
      email: data.email,
      service: serviceLabel,
      message: data.message,
      businessName: settings.businessName,
    });
    await sendMail({ to: data.email, ...acknowledgement });
  } catch (error) {
    console.error("Failed to send enquiry acknowledgement email:", error);
  }

  return { enquiryId: enquiry.id };
}
