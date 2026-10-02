import { prisma } from "@/lib/db";
import { getStorageDriver } from "@/lib/storage";
import { validateUpload, type UploadPurpose } from "@/lib/storage/validate-upload";

export interface MediaOwner {
  chardhamPackageId?: string;
  trekId?: string;
  farmPropertyId?: string;
  roomId?: string;
  placeId?: string;
}

export async function uploadMedia(params: {
  buffer: Buffer;
  declaredMimeType: string;
  purpose: UploadPurpose;
  originalFilename?: string;
  owner?: MediaOwner;
}) {
  const validated = await validateUpload({
    buffer: params.buffer,
    declaredMimeType: params.declaredMimeType,
    purpose: params.purpose,
    originalFilename: params.originalFilename,
  });

  const storage = getStorageDriver();
  const saved = await storage.save(validated.buffer, validated.filename, validated.mimeType);

  return prisma.media.create({
    data: {
      url: saved.url,
      filename: validated.filename,
      mimeType: validated.mimeType,
      size: saved.size,
      purpose: params.purpose,
      chardhamPackageId: params.owner?.chardhamPackageId,
      trekId: params.owner?.trekId,
      farmPropertyId: params.owner?.farmPropertyId,
      roomId: params.owner?.roomId,
      placeId: params.owner?.placeId,
    },
  });
}

export async function deleteMedia(mediaId: string) {
  const media = await prisma.media.findUnique({ where: { id: mediaId } });
  if (!media) return;

  const storage = getStorageDriver();
  await storage.delete(media.url);
  await prisma.media.delete({ where: { id: mediaId } });
}
