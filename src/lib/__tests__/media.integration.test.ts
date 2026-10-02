import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/db";
import { uploadMedia } from "@/lib/media";
import { __resetStorageDriverForTests } from "@/lib/storage";

async function makePngBuffer() {
  return sharp({
    create: { width: 4, height: 4, channels: 3, background: { r: 1, g: 2, b: 3 } },
  })
    .png()
    .toBuffer();
}

describe("uploadMedia", () => {
  let tempDir: string;
  const originalUploadDir = process.env.UPLOAD_DIR;

  beforeAll(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "chardham-media-"));
  });

  afterAll(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
    process.env.UPLOAD_DIR = originalUploadDir;
    __resetStorageDriverForTests();
  });

  beforeEach(async () => {
    process.env.UPLOAD_DIR = tempDir;
    __resetStorageDriverForTests();
    await prisma.media.deleteMany();
    await prisma.farmProperty.deleteMany();
  });

  afterEach(async () => {
    await prisma.media.deleteMany();
    await prisma.farmProperty.deleteMany();
  });

  it("stores the file and creates a linked Media row", async () => {
    const farm = await prisma.farmProperty.create({ data: { description: "test" } });
    const buffer = await makePngBuffer();

    const media = await uploadMedia({
      buffer,
      declaredMimeType: "image/png",
      purpose: "IMAGE",
      owner: { farmPropertyId: farm.id },
    });

    expect(media.farmPropertyId).toBe(farm.id);
    expect(media.mimeType).toBe("image/jpeg");
    expect(media.url).toMatch(/^\/uploads\/.+\.jpg$/);

    const writtenPath = path.join(tempDir, path.basename(media.url));
    const stat = await fs.stat(writtenPath);
    expect(stat.size).toBe(media.size);
  });

  it("links an upload to a place", async () => {
    await prisma.place.deleteMany();
    const place = await prisma.place.create({
      data: { slug: "p", title: "P", summary: "s", body: "b" },
    });

    const media = await uploadMedia({
      buffer: await makePngBuffer(),
      declaredMimeType: "image/png",
      purpose: "IMAGE",
      owner: { placeId: place.id },
    });

    expect(media.placeId).toBe(place.id);
    await prisma.media.deleteMany();
    await prisma.place.deleteMany();
  });

  it("creates an un-owned Media row when no owner is given", async () => {
    const buffer = await makePngBuffer();

    const media = await uploadMedia({
      buffer,
      declaredMimeType: "image/png",
      purpose: "IMAGE",
    });

    expect(media.chardhamPackageId).toBeNull();
    expect(media.trekId).toBeNull();
    expect(media.farmPropertyId).toBeNull();
    expect(media.roomId).toBeNull();
  });

  it("does not create a Media row when validation fails", async () => {
    await expect(
      uploadMedia({
        buffer: Buffer.from("not a real image"),
        declaredMimeType: "image/png",
        purpose: "IMAGE",
      })
    ).rejects.toThrow();

    expect(await prisma.media.count()).toBe(0);
  });
});
