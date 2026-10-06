// @vitest-environment node
import { mkdtempSync, existsSync, copyFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import sharp from "sharp";
import { describe, it, expect, beforeEach } from "vitest";
import { prepareImages } from "../prepare-images";

async function makeJpg(file: string, width: number, height: number, colour: string) {
  await sharp({ create: { width, height, channels: 3, background: colour } })
    .jpeg()
    .toFile(file);
}

describe("prepareImages", () => {
  let src: string;
  let out: string;

  beforeEach(() => {
    const root = mkdtempSync(path.join(tmpdir(), "prep-images-"));
    src = path.join(root, "src");
    out = path.join(root, "out");
    mkdirSync(src);
  });

  it("writes each manifest entry under its slug name", async () => {
    await makeJpg(path.join(src, "a b (1).jpg"), 800, 600, "#336699");

    await prepareImages(src, out, [{ src: "a b (1).jpg", out: "devrana-trek-1.jpg" }]);

    expect(existsSync(path.join(out, "devrana-trek-1.jpg"))).toBe(true);
  });

  it("downsizes anything wider than 1600px and never upsizes", async () => {
    await makeJpg(path.join(src, "big.jpg"), 2048, 1536, "#336699");
    await makeJpg(path.join(src, "small.jpg"), 720, 540, "#336699");

    await prepareImages(src, out, [
      { src: "big.jpg", out: "big.jpg" },
      { src: "small.jpg", out: "small.jpg" },
    ]);

    expect((await sharp(path.join(out, "big.jpg")).metadata()).width).toBe(1600);
    expect((await sharp(path.join(out, "small.jpg")).metadata()).width).toBe(720);
  });

  it("rotates images stored sideways", async () => {
    await makeJpg(path.join(src, "side.jpg"), 576, 1280, "#336699");

    await prepareImages(src, out, [{ src: "side.jpg", out: "side.jpg", rotate: 90 }]);

    const meta = await sharp(path.join(out, "side.jpg")).metadata();
    expect([meta.width, meta.height]).toEqual([1280, 576]);
  });

  it("crops the camera watermark strip off the bottom", async () => {
    await makeJpg(path.join(src, "mark.jpg"), 1200, 1600, "#336699");

    await prepareImages(src, out, [{ src: "mark.jpg", out: "mark.jpg", cropBottomPct: 8 }]);

    const meta = await sharp(path.join(out, "mark.jpg")).metadata();
    expect([meta.width, meta.height]).toEqual([1200, 1472]);
  });

  it("cuts out a rectangle, to drop the black bars around a phone screenshot", async () => {
    await makeJpg(path.join(src, "shot.jpg"), 720, 1600, "#336699");

    await prepareImages(src, out, [
      { src: "shot.jpg", out: "shot.jpg", crop: { top: 520, height: 540 } },
    ]);

    const meta = await sharp(path.join(out, "shot.jpg")).metadata();
    expect([meta.width, meta.height]).toEqual([720, 540]);
  });

  it("skips a later entry whose bytes duplicate an earlier one", async () => {
    await makeJpg(path.join(src, "one.jpg"), 800, 600, "#336699");
    copyFileSync(path.join(src, "one.jpg"), path.join(src, "copy.jpg"));

    const written = await prepareImages(src, out, [
      { src: "one.jpg", out: "one.jpg" },
      { src: "copy.jpg", out: "copy.jpg" },
    ]);

    expect(written).toEqual(["one.jpg"]);
    expect(existsSync(path.join(out, "copy.jpg"))).toBe(false);
  });
});
