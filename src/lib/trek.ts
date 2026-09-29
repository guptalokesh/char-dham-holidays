import { prisma } from "@/lib/db";
import { UserFacingError } from "@/lib/errors";
import { getWebsiteSettings } from "@/lib/settings";
import { buildTrekWhatsAppMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import {
  trekCreateSchema,
  trekRequestSchema,
  trekUpdateSchema,
  type TrekCreateInput,
  type TrekRequestInput,
  type TrekUpdateInput,
} from "@/lib/validation/trek";

function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function generateUniqueSlug(base: string): Promise<string> {
  let candidate = base;
  let suffix = 1;
  while (await prisma.trek.findUnique({ where: { slug: candidate } })) {
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }
  return candidate;
}

export async function createTrek(input: TrekCreateInput) {
  const data = trekCreateSchema.parse(input);
  const baseSlug = data.slug ?? slugify(data.name);
  const slug = await generateUniqueSlug(baseSlug);

  return prisma.trek.create({
    data: {
      slug,
      name: data.name,
      description: data.description,
      price: data.price ?? null,
    },
  });
}

export async function updateTrek(id: string, input: TrekUpdateInput) {
  const data = trekUpdateSchema.parse(input);
  return prisma.trek.update({ where: { id }, data, include: { images: true, itineraryMedia: true } });
}

export async function listTreks(options?: { activeOnly?: boolean }) {
  const activeOnly = options?.activeOnly ?? true;
  return prisma.trek.findMany({
    where: activeOnly ? { active: true } : undefined,
    orderBy: { order: "asc" },
    include: { images: true },
  });
}

export async function getTrekBySlug(slug: string) {
  return prisma.trek.findUnique({
    where: { slug },
    include: { images: true, itineraryMedia: true },
  });
}

export async function getTrekById(id: string) {
  return prisma.trek.findUnique({
    where: { id },
    include: { images: true, itineraryMedia: true },
  });
}

export async function setTrekItinerary(trekId: string, mediaId: string | null) {
  if (mediaId !== null) {
    const media = await prisma.media.findUnique({ where: { id: mediaId } });
    if (!media || media.purpose !== "PDF") {
      throw new UserFacingError("Itinerary must reference an uploaded PDF.");
    }
  }

  return prisma.trek.update({
    where: { id: trekId },
    data: { itineraryMediaId: mediaId },
    include: { images: true, itineraryMedia: true },
  });
}

export interface TrekRequestResult {
  whatsappUrl: string | null;
}

export async function submitTrekRequest(
  trekId: string,
  input: TrekRequestInput
): Promise<TrekRequestResult> {
  const data = trekRequestSchema.parse(input);

  const trek = await prisma.trek.findUnique({ where: { id: trekId } });
  if (!trek) {
    throw new UserFacingError("Trek not found.");
  }

  await prisma.enquiry.create({
    data: {
      name: data.name,
      phone: data.phone,
      service: "TREKKING",
      trekId: trek.id,
      details: {
        people: data.people,
        preferredDate: data.preferredDate,
        requirements: data.requirements ?? null,
      },
    },
  });

  const settings = await getWebsiteSettings();
  if (!settings.whatsappNumber) {
    return { whatsappUrl: null };
  }

  const message = buildTrekWhatsAppMessage({
    trekName: trek.name,
    people: data.people,
    preferredDate: data.preferredDate,
    requirements: data.requirements ?? "",
  });

  return { whatsappUrl: buildWhatsAppUrl(settings.whatsappNumber, message) };
}
