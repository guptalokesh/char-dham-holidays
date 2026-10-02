import { prisma } from "@/lib/db";
import { placeUpdateSchema, type PlaceUpdateInput } from "@/lib/validation/place";

const withImages = { images: { orderBy: { createdAt: "asc" as const } } };

export async function listPlaces(options?: { activeOnly?: boolean }) {
  const activeOnly = options?.activeOnly ?? true;
  return prisma.place.findMany({
    where: activeOnly ? { active: true } : undefined,
    orderBy: { order: "asc" },
    include: withImages,
  });
}

export async function getPlaceBySlug(slug: string) {
  return prisma.place.findUnique({ where: { slug }, include: withImages });
}

export async function getPlaceById(id: string) {
  return prisma.place.findUnique({ where: { id }, include: withImages });
}

export async function updatePlace(id: string, input: PlaceUpdateInput) {
  const data = placeUpdateSchema.parse(input);
  return prisma.place.update({ where: { id }, data, include: withImages });
}
