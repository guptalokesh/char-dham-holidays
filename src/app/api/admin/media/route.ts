import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";
import { uploadMedia } from "@/lib/media";
import { UploadValidationError } from "@/lib/storage/validate-upload";
import { mediaOwnerFields, mediaUploadFormSchema } from "@/lib/validation/media";
import { getClientIp } from "@/lib/request-ip";
import { RateLimiter } from "@/lib/rate-limit";

const MAX_REQUEST_BYTES = 20 * 1024 * 1024; // generous ceiling; validateUpload enforces the real per-type limit
const uploadRateLimiter = new RateLimiter(30, 15 * 60 * 1000);

export async function POST(request: NextRequest) {
  const admin = await requireAdminSession(await cookies());
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const rateLimit = uploadRateLimiter.consume(getClientIp(request));
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many uploads. Please try again later." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "A file is required." }, { status: 400 });
  }
  if (file.size > MAX_REQUEST_BYTES) {
    return NextResponse.json({ error: "File is too large." }, { status: 413 });
  }

  const parsed = mediaUploadFormSchema.safeParse({
    purpose: formData.get("purpose"),
    chardhamPackageId: formData.get("chardhamPackageId") ?? undefined,
    trekId: formData.get("trekId") ?? undefined,
    farmPropertyId: formData.get("farmPropertyId") ?? undefined,
    roomId: formData.get("roomId") ?? undefined,
    placeId: formData.get("placeId") ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid upload request.", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const owner = Object.fromEntries(
    mediaOwnerFields
      .filter((field) => parsed.data[field] !== undefined)
      .map((field) => [field, parsed.data[field] as string])
  );

  if (Object.keys(owner).length > 0) {
    const [field, id] = Object.entries(owner)[0];
    const exists = await ownerExists(field, id);
    if (!exists) {
      return NextResponse.json({ error: "Referenced listing was not found." }, { status: 404 });
    }
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const media = await uploadMedia({
      buffer,
      declaredMimeType: file.type,
      purpose: parsed.data.purpose,
      originalFilename: file.name,
      owner,
    });
    return NextResponse.json({ media }, { status: 201 });
  } catch (error) {
    if (error instanceof UploadValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    throw error;
  }
}

async function ownerExists(field: string, id: string): Promise<boolean> {
  switch (field) {
    case "chardhamPackageId":
      return (await prisma.chardhamPackage.count({ where: { id } })) > 0;
    case "trekId":
      return (await prisma.trek.count({ where: { id } })) > 0;
    case "farmPropertyId":
      return (await prisma.farmProperty.count({ where: { id } })) > 0;
    case "roomId":
      return (await prisma.room.count({ where: { id } })) > 0;
    case "placeId":
      return (await prisma.place.count({ where: { id } })) > 0;
    default:
      return false;
  }
}
