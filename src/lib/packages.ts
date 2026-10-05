import { prisma } from "@/lib/db";
import { UserFacingError } from "@/lib/errors";
import {
  chardhamPackageUpdateSchema,
  packageStepSchema,
  type ChardhamPackageUpdateInput,
  type PackageStep,
} from "@/lib/validation/chardham";

const include = {
  images: { orderBy: { createdAt: "asc" as const } },
  itineraryMedia: true,
};

export async function listPackages(options?: { activeOnly?: boolean }) {
  const activeOnly = options?.activeOnly ?? true;
  return prisma.chardhamPackage.findMany({
    where: activeOnly ? { active: true } : undefined,
    orderBy: { order: "asc" },
    include,
  });
}

export async function getPackageBySlug(slug: string) {
  return prisma.chardhamPackage.findUnique({ where: { slug }, include });
}

export async function getPackageById(id: string) {
  return prisma.chardhamPackage.findUnique({ where: { id }, include });
}

export async function updatePackage(id: string, input: ChardhamPackageUpdateInput) {
  const data = chardhamPackageUpdateSchema.parse(input);
  return prisma.chardhamPackage.update({ where: { id }, data, include });
}

export function parseSteps(value: unknown): PackageStep[] {
  const steps: PackageStep[] = [];
  if (!Array.isArray(value)) return steps;
  for (const item of value) {
    const parsed = packageStepSchema.safeParse(item);
    if (parsed.success) steps.push(parsed.data);
  }
  return steps;
}

export async function setPackageItinerary(id: string, mediaId: string | null) {
  if (mediaId !== null) {
    const media = await prisma.media.findUnique({ where: { id: mediaId } });
    if (!media || media.purpose !== "PDF") {
      throw new UserFacingError("Itinerary must reference an uploaded PDF.");
    }
  }

  return prisma.chardhamPackage.update({
    where: { id },
    data: { itineraryMediaId: mediaId },
    include,
  });
}
