import { prisma } from "@/lib/db";
import { CHARDHAM_PACKAGE_ID } from "@/lib/constants";
import { UserFacingError } from "@/lib/errors";
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
      slug: "char-dham",
      name: "Char Dham Yatra by Helicopter",
      price: 21000,
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
      throw new UserFacingError("Itinerary must reference an uploaded PDF.");
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

  const pkg = await prisma.chardhamPackage.findFirst({
    where: { slug: data.packageSlug, active: true },
  });
  if (!pkg) {
    throw new UserFacingError("The selected yatra was not found.");
  }

  const dhams = data.dhams ?? [];
  if (pkg.dhamChoice && dhams.length === 0) {
    throw new UserFacingError("Please choose at least one dham.");
  }

  await prisma.enquiry.create({
    data: {
      name: data.name,
      phone: data.phone,
      service: "CHARDHAM",
      chardhamPackageId: pkg.id,
      details: {
        packageName: pkg.name,
        preferredDate: data.preferredDate,
        travellers: data.travellers,
        ...(dhams.length > 0 && { dhams }),
      },
    },
  });

  const settings = await getWebsiteSettings();
  if (!settings.whatsappNumber) {
    return { whatsappUrl: null };
  }

  const message = buildChardhamWhatsAppMessage({
    packageName: pkg.name,
    dhams,
    preferredDate: data.preferredDate,
    travellers: data.travellers,
  });

  return { whatsappUrl: buildWhatsAppUrl(settings.whatsappNumber, message) };
}
