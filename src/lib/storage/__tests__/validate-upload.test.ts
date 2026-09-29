import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { UploadValidationError, validateUpload } from "@/lib/storage/validate-upload";

async function makePngBuffer() {
  return sharp({
    create: { width: 4, height: 4, channels: 3, background: { r: 10, g: 20, b: 30 } },
  })
    .png()
    .toBuffer();
}

function makePdfBuffer() {
  return Buffer.from(
    "%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF"
  );
}

describe("validateUpload", () => {
  it("accepts a real PNG image and re-encodes it", async () => {
    const buffer = await makePngBuffer();

    const result = await validateUpload({
      buffer,
      declaredMimeType: "image/png",
      purpose: "IMAGE",
    });

    expect(result.mimeType).toBe("image/jpeg");
    expect(result.filename).toMatch(/^[0-9a-f-]+\.jpg$/);
    expect(result.buffer.length).toBeGreaterThan(0);
  });

  it("accepts a minimal valid PDF", async () => {
    const buffer = makePdfBuffer();

    const result = await validateUpload({
      buffer,
      declaredMimeType: "application/pdf",
      purpose: "PDF",
    });

    expect(result.mimeType).toBe("application/pdf");
    expect(result.filename).toMatch(/^[0-9a-f-]+\.pdf$/);
  });

  it("rejects a PDF submitted as an image", async () => {
    const buffer = makePdfBuffer();

    await expect(
      validateUpload({ buffer, declaredMimeType: "image/jpeg", purpose: "IMAGE" })
    ).rejects.toThrow(UploadValidationError);
  });

  it("rejects an image submitted as a PDF", async () => {
    const buffer = await makePngBuffer();

    await expect(
      validateUpload({ buffer, declaredMimeType: "application/pdf", purpose: "PDF" })
    ).rejects.toThrow(UploadValidationError);
  });

  it("rejects unrecognized binary data", async () => {
    const buffer = Buffer.from([0x7f, 0x45, 0x4c, 0x46, 1, 2, 3, 4]); // ELF magic bytes

    await expect(
      validateUpload({ buffer, declaredMimeType: "image/jpeg", purpose: "IMAGE" })
    ).rejects.toThrow(UploadValidationError);
  });

  it("rejects SVG files even though they are text-based", async () => {
    const buffer = Buffer.from('<svg onload="alert(1)"></svg>');

    await expect(
      validateUpload({ buffer, declaredMimeType: "image/svg+xml", purpose: "IMAGE" })
    ).rejects.toThrow(UploadValidationError);
  });

  it("rejects an oversized image", async () => {
    const small = await makePngBuffer();
    const oversized = Buffer.concat([small, Buffer.alloc(9 * 1024 * 1024)]);

    await expect(
      validateUpload({ buffer: oversized, declaredMimeType: "image/png", purpose: "IMAGE" })
    ).rejects.toThrow(UploadValidationError);
  });

  it("ignores the original filename and always generates a safe random name", async () => {
    const buffer = await makePngBuffer();

    const result = await validateUpload({
      buffer,
      declaredMimeType: "image/png",
      purpose: "IMAGE",
      originalFilename: "../../../etc/evil.jpg",
    });

    expect(result.filename).not.toContain("..");
    expect(result.filename).not.toContain("/");
  });
});
