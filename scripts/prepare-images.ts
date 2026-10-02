import { createHash } from "node:crypto";
import { mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const MAX_WIDTH = 1600;

export type ManifestEntry = {
  src: string;
  out: string;
  rotate?: number;
  cropBottomPct?: number;
};

export async function prepareImages(
  srcDir: string,
  outDir: string,
  manifest: ManifestEntry[],
): Promise<string[]> {
  mkdirSync(outDir, { recursive: true });
  const seen = new Set<string>();
  const written: string[] = [];

  for (const entry of manifest) {
    const bytes = readFileSync(path.join(srcDir, entry.src));
    const hash = createHash("sha256").update(bytes).digest("hex");
    if (seen.has(hash)) continue;
    seen.add(hash);

    let img = sharp(bytes);
    if (entry.rotate) img = sharp(await img.rotate(entry.rotate).toBuffer());
    if (entry.cropBottomPct) {
      const { width = 0, height = 0 } = await img.metadata();
      const keep = Math.round(height * (1 - entry.cropBottomPct / 100));
      img = sharp(await img.extract({ left: 0, top: 0, width, height: keep }).toBuffer());
    }

    await img
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .jpeg({ quality: 82 })
      .toFile(path.join(outDir, entry.out));
    written.push(entry.out);
  }

  return written;
}

const IMAGES = path.join(process.cwd(), "images");

export const MANIFEST: { dir: string; entries: ManifestEntry[] }[] = [
  {
    dir: "devrana mela and mandir",
    entries: [
      { src: "49447.jpg", out: "devrana-mela-hero.jpg" },
      { src: "49444.jpg", out: "devrana-mandir-1.jpg" },
      { src: "49453.jpg", out: "devrana-mandir-snow.jpg", cropBottomPct: 8 },
      { src: "IMG-20261001-WA0010.jpg", out: "devrana-ridges.jpg" },
      { src: "49456.jpg", out: "basecamp-village.jpg", rotate: 90, cropBottomPct: 8 },
      { src: "49474.jpg", out: "basecamp-slope.jpg", rotate: 90 },
    ],
  },
  {
    dir: "bugyaal Trek",
    entries: [
      { src: "49441.jpg", out: "devrana-trek-hero.jpg" },
      { src: "IMG-20261002-WA0009.jpg", out: "bugyal-summit.jpg" },
      { src: "IMG-20261002-WA0007.jpg", out: "bugyal-horses.jpg" },
      { src: "IMG-20261002-WA0012.jpg", out: "bugyal-valley.jpg" },
      { src: "IMG-20261002-WA0014.jpg", out: "bugyal-tree.jpg" },
    ],
  },
  {
    dir: "hotel and rooms",
    entries: [
      { src: "49434.jpg", out: "hotel-exterior.jpg" },
      { src: "49432.jpg", out: "room-deluxe-1.jpg" },
      { src: "49436.jpg", out: "room-deluxe-2.jpg" },
      { src: "49433.jpg", out: "room-twin.jpg", cropBottomPct: 8 },
      { src: "49431.jpg", out: "hotel-lounge.jpg" },
    ],
  },
  {
    dir: "local basecamp - dhari kalogi",
    entries: [{ src: "49459.jpg", out: "basecamp-aerial.jpg", cropBottomPct: 8 }],
  },
];

async function main() {
  const outDir = path.join(IMAGES, "curated");
  for (const group of MANIFEST) {
    const written = await prepareImages(path.join(IMAGES, group.dir), outDir, group.entries);
    console.log(`${group.dir}: ${written.length} written`);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename ?? "")) {
  main();
}
