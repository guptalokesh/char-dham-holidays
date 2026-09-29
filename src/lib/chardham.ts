import { prisma } from "@/lib/db";
import { CHARDHAM_PACKAGE_ID } from "@/lib/constants";
import { getWebsiteSettings } from "@/lib/settings";
import { buildChardhamWhatsAppMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import {
  chardhamAvailabilityRequestSchema,
  chardhamPackageUpdateSchema,
  type ChardhamAvailabilityRequestInput,
  type ChardhamPackageUpdateInput,
} from "@/lib/validation/chardham";

export async function getChardhamPackage() {
  return prisma.chardhamPackage.upsert({
    where: { id: CHARDHAM_PACKAGE_ID },
    update: {},
    create: {
      id: CHARDHAM_PACKAGE_ID,
      price: 0,
      destinations: [],
      stayInfo: "",
      foodInfo: "",
      travelInfo: "",
    },
    include: { images: true, itineraryMedia: true },
  });
}

export async function setChardhamItinerary(mediaId: string | null) {
  await getChardhamPackage();

  if (mediaId !== null) {
    const media = await prisma.media.findUnique({ where: { id: mediaId } });
    if (!media || media.purpose !== "PDF") {
      throw new Error("Itinerary must reference an uploaded PDF.");
    }
  }

  return prisma.chardhamPackage.update({
    where: { id: CHARDHAM_PACKAGE_ID },
    data: { itineraryMediaId: mediaId },
    include: { images: true, itineraryMedia: true },
  });
}

export async function updateChardhamPackage(input: ChardhamPackageUpdateInput) {
  const data = chardhamPackageUpdateSchema.parse(input);

  await getChardhamPackage();

  return prisma.chardhamPackage.update({
    where: { id: CHARDHAM_PACKAGE_ID },
    data,
    include: { images: true },
  });
}

export interface AvailabilityRequestResult {
  whatsappUrl: string | null;
}

export async function submitChardhamAvailabilityRequest(
  input: ChardhamAvailabilityRequestInput
): Promise<AvailabilityRequestResult> {
  const data = chardhamAvailabilityRequestSchema.parse(input);

  await prisma.enquiry.create({
    data: {
      name: data.name,
      phone: data.phone,
      service: "CHARDHAM",
      details: { preferredDate: data.preferredDate, travellers: data.travellers },
    },
  });

  const settings = await getWebsiteSettings();
  if (!settings.whatsappNumber) {
    return { whatsappUrl: null };
  }

  const message = buildChardhamWhatsAppMessage({
    preferredDate: data.preferredDate,
    travellers: data.travellers,
  });

  return { whatsappUrl: buildWhatsAppUrl(settings.whatsappNumber, message) };
}
