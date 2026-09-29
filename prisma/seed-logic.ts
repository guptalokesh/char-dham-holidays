import fs from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/db";
import {
  CHARDHAM_PACKAGE_ID,
  FARM_PROPERTY_ID,
  WEBSITE_SETTINGS_ID,
} from "../src/lib/constants";

const PROJECT_ROOT = path.resolve(__dirname, "..");
const SOURCE_IMAGES_DIR = path.join(PROJECT_ROOT, "images");
const SEED_IMAGES_DIR = path.join(PROJECT_ROOT, "public", "seed-images");

function copySeedImage(sourceRelativePath: string, filename: string) {
  fs.mkdirSync(SEED_IMAGES_DIR, { recursive: true });
  const source = path.join(SOURCE_IMAGES_DIR, sourceRelativePath);
  const destination = path.join(SEED_IMAGES_DIR, filename);
  fs.copyFileSync(source, destination);
  const { size } = fs.statSync(destination);
  return { url: `/seed-images/${filename}`, filename, size };
}

async function upsertMedia(
  id: string,
  sourceRelativePath: string,
  filename: string,
  owner: Record<string, string>
) {
  const { url, size } = copySeedImage(sourceRelativePath, filename);
  return prisma.media.upsert({
    where: { id },
    update: { url, filename, size, ...owner },
    create: {
      id,
      url,
      filename,
      size,
      mimeType: "image/jpeg",
      purpose: "IMAGE",
      ...owner,
    },
  });
}

async function seedAdminUser() {
  const email = process.env.ADMIN_EMAIL ?? "admin@chardhamholidays.example";
  const password = process.env.ADMIN_PASSWORD ?? "ChangeMe123!";
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.adminUser.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash },
  });

  if (!process.env.ADMIN_PASSWORD) {
    console.warn(
      `\n⚠ No ADMIN_PASSWORD set — seeded a dev-only admin login: ${email} / ${password}\n` +
        `  Set ADMIN_EMAIL and ADMIN_PASSWORD before deploying to production.\n`
    );
  }
}

async function seedWebsiteSettings() {
  await prisma.websiteSettings.upsert({
    where: { id: WEBSITE_SETTINGS_ID },
    update: {},
    create: { id: WEBSITE_SETTINGS_ID },
  });
}

async function seedChardham() {
  await prisma.chardhamPackage.upsert({
    where: { id: CHARDHAM_PACKAGE_ID },
    update: {},
    create: {
      id: CHARDHAM_PACKAGE_ID,
      name: "Chardham Yatra by Helicopter",
      price: 210000,
      destinations: ["Yamunotri", "Gangotri", "Sri Kedarnath", "Badrinath"],
      stayInfo: "Included",
      foodInfo: "Included",
      travelInfo: "Included",
    },
  });

  await upsertMedia("media-chardham-hero", "chardham.jpg", "chardham.jpg", {
    chardhamPackageId: CHARDHAM_PACKAGE_ID,
  });
}

async function seedTreks() {
  const devrana = await prisma.trek.upsert({
    where: { slug: "devrana-trek" },
    update: {},
    create: {
      slug: "devrana-trek",
      name: "Devrana Trek",
      description:
        "A customised trekking experience through Devrana. Final dates, group size, pricing and itinerary are confirmed directly with our team over WhatsApp.",
      order: 1,
    },
  });
  await upsertMedia("media-devrana-trek", "trek-forest.jpg", "trek-devrana.jpg", {
    trekId: devrana.id,
  });

  const rupnyol = await prisma.trek.upsert({
    where: { slug: "rupnyol-bugyal-trek" },
    update: {},
    create: {
      slug: "rupnyol-bugyal-trek",
      name: "Rupnyol Bugyal Trek",
      description:
        "A customised trekking experience through Rupnyol Bugyal. Final dates, group size, pricing and itinerary are confirmed directly with our team over WhatsApp.",
      order: 2,
    },
  });
  await upsertMedia("media-rupnyol-trek", "trek-bugyal.jpg", "trek-rupnyol.jpg", {
    trekId: rupnyol.id,
  });
}

async function seedFarmHomeStay() {
  await prisma.farmProperty.upsert({
    where: { id: FARM_PROPERTY_ID },
    update: {},
    create: {
      id: FARM_PROPERTY_ID,
      description: "Nature-focused accommodation on our farm property.",
    },
  });
  await upsertMedia("media-farm-hero", "homestay.jpg", "homestay.jpg", {
    farmPropertyId: FARM_PROPERTY_ID,
  });

  // Sample/development pricing only — not confirmed client data. Editable by admin.
  const deluxe = await prisma.room.upsert({
    where: { id: "singleton-room-deluxe" },
    update: {},
    create: {
      id: "singleton-room-deluxe",
      farmPropertyId: FARM_PROPERTY_ID,
      name: "Deluxe Room",
      price: 3500,
      capacity: 2,
    },
  });

  const cottage = await prisma.room.upsert({
    where: { id: "singleton-room-cottage" },
    update: {},
    create: {
      id: "singleton-room-cottage",
      farmPropertyId: FARM_PROPERTY_ID,
      name: "Farm View Cottage",
      price: 5200,
      capacity: 4,
    },
  });

  const today = new Date();
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    d.setHours(0, 0, 0, 0);
    return d;
  });

  for (const room of [deluxe, cottage]) {
    for (const date of days) {
      await prisma.roomAvailability.upsert({
        where: { roomId_date: { roomId: room.id, date } },
        update: {},
        create: { roomId: room.id, date, status: "AVAILABLE" },
      });
    }
  }
}

export async function runSeed() {
  await seedAdminUser();
  await seedWebsiteSettings();
  await seedChardham();
  await seedTreks();
  await seedFarmHomeStay();
}
