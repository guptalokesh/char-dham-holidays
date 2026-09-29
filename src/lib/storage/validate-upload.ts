import crypto from "node:crypto";
import sharp from "sharp";

export type UploadPurpose = "IMAGE" | "PDF";

export class UploadValidationError extends Error {}

const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8MB
const MAX_PDF_BYTES = 15 * 1024 * 1024; // 15MB

interface FileSignature {
  mime: string;
  match: (buffer: Buffer) => boolean;
}

const SIGNATURES: FileSignature[] = [
  {
    mime: "image/jpeg",
    match: (b) => b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  },
  {
    mime: "image/png",
    match: (b) =>
      b.length > 8 &&
      b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  },
  {
    mime: "image/webp",
    match: (b) =>
      b.length > 12 &&
      b.subarray(0, 4).toString("ascii") === "RIFF" &&
      b.subarray(8, 12).toString("ascii") === "WEBP",
  },
  {
    mime: "application/pdf",
    match: (b) => b.length > 5 && b.subarray(0, 5).toString("ascii") === "%PDF-",
  },
];

function detectSignature(buffer: Buffer): FileSignature | undefined {
  return SIGNATURES.find((signature) => signature.match(buffer));
}

export interface ValidatedUpload {
  buffer: Buffer;
  filename: string;
  mimeType: string;
}

export async function validateUpload(params: {
  buffer: Buffer;
  declaredMimeType: string;
  purpose: UploadPurpose;
  originalFilename?: string;
}): Promise<ValidatedUpload> {
  const { buffer, purpose } = params;

  const signature = detectSignature(buffer);
  if (!signature) {
    throw new UploadValidationError("Unrecognized or unsupported file type.");
  }

  const isImage = signature.mime.startsWith("image/");
  if (purpose === "IMAGE" && !isImage) {
    throw new UploadValidationError("Expected an image file (JPEG, PNG or WEBP).");
  }
  if (purpose === "PDF" && signature.mime !== "application/pdf") {
    throw new UploadValidationError("Expected a PDF file.");
  }

  const maxBytes = purpose === "IMAGE" ? MAX_IMAGE_BYTES : MAX_PDF_BYTES;
  if (buffer.length > maxBytes) {
    throw new UploadValidationError(
      `File is too large. Maximum size is ${Math.floor(maxBytes / (1024 * 1024))}MB.`
    );
  }

  const id = crypto.randomUUID();

  if (isImage) {
    let reencoded: Buffer;
    try {
      // Re-encoding through sharp strips any non-image payload appended to a
      // valid image file (a common way to smuggle content past a magic-byte
      // check) and normalizes format/metadata. It also rejects truncated or
      // otherwise corrupt files that merely start with a valid signature.
      reencoded = await sharp(buffer)
        .rotate()
        .resize({ width: 1920, withoutEnlargement: true })
        .jpeg({ quality: 82 })
        .toBuffer();
    } catch {
      throw new UploadValidationError("The image file could not be processed.");
    }
    return { buffer: reencoded, filename: `${id}.jpg`, mimeType: "image/jpeg" };
  }

  return { buffer, filename: `${id}.pdf`, mimeType: "application/pdf" };
}
