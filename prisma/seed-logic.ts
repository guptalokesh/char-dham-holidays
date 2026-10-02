import fs from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/db";
import { addDays, todayDateOnly } from "../src/lib/date-utils";
import {
  CHARDHAM_PACKAGE_ID,
  FARM_PROPERTY_ID,
  WEBSITE_SETTINGS_ID,
} from "../src/lib/constants";

const BUSINESS_PHONE = "+91 8958405555";
const BUSINESS_EMAIL = "Sanjaythapliyal02@gmail.com";

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

// Sequential on purpose: Media.createdAt decides gallery order, first image is the hero.
async function upsertGallery(
  idPrefix: string,
  filenames: string[],
  owner: Record<string, string>
) {
  for (const [i, filename] of filenames.entries()) {
    await upsertMedia(`${idPrefix}-${i + 1}`, `curated/${filename}`, filename, owner);
  }
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
    create: {
      id: WEBSITE_SETTINGS_ID,
      primaryPhone: BUSINESS_PHONE,
      whatsappNumber: BUSINESS_PHONE,
      primaryEmail: BUSINESS_EMAIL,
      enquiryEmail: BUSINESS_EMAIL,
    },
  });

  const logo = await upsertMedia(
    "media-logo",
    "logo/IMG-20260927-WA0005.jpg",
    "logo.jpg",
    {}
  );
  await prisma.websiteSettings.update({
    where: { id: WEBSITE_SETTINGS_ID },
    data: { logoMediaId: logo.id },
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
      aircraftHandlingInfo:
        "We handle helicopter ground and aircraft coordination for Yamunotri and Gangotri. Yamunotri flights land at the Kharsali helipad, a short walk from the temple; Gangotri flights land at the Harsil helipad, followed by a road transfer. Our team arranges landing, boarding and transfers. Flights depend on weather and operator schedules.",
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
  await upsertGallery(
    "media-devrana-trek",
    ["devrana-trek-hero.jpg", "devrana-mandir-1.jpg", "devrana-mela-hero.jpg"],
    { trekId: devrana.id }
  );

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
  await upsertGallery(
    "media-rupnyol-trek",
    ["bugyal-summit.jpg", "bugyal-horses.jpg", "bugyal-valley.jpg", "bugyal-tree.jpg"],
    { trekId: rupnyol.id }
  );
}

async function seedPlaces() {
  const mandir = await prisma.place.upsert({
    where: { slug: "devrana-mandir" },
    update: {},
    create: {
      slug: "devrana-mandir",
      title: "Devrana Mandir & Mela",
      summary: "Rudreshwar Mahadev Mandir at Devrana, and the village mela that gathers around it.",
      body:
        "Rudreshwar Mahadev Mandir stands among deodar forest at Devrana, in the Tiyan area. Pilgrims and villagers gather here for the Devrana mela, and the temple is the destination of our Devrana Trek. Mela dates are announced locally — contact our team to plan your visit.",
      address: "Devrana, Tiyan area, Uttarakhand",
      order: 1,
    },
  });
  await upsertGallery(
    "media-place-devrana",
    ["devrana-mela-hero.jpg", "devrana-mandir-1.jpg", "devrana-mandir-snow.jpg", "devrana-ridges.jpg"],
    { placeId: mandir.id }
  );

  const camp = await prisma.place.upsert({
    where: { slug: "dhari-kalogi-basecamp" },
    update: {},
    create: {
      slug: "dhari-kalogi-basecamp",
      title: "Dhari–Kalogi Base Camp",
      summary: "Our local base camp for the Devrana and Rupnyol Bugyal treks.",
      body:
        "Dhari–Kalogi is our local base camp, with terraced hillside villages and wide valley views. Treks to Devrana and Rupnyol Bugyal start from here. Contact our team for directions and arrival details.",
      order: 2,
    },
  });
  await upsertGallery(
    "media-place-basecamp",
    ["basecamp-aerial.jpg", "basecamp-village.jpg", "basecamp-slope.jpg"],
    { placeId: camp.id }
  );
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
  await upsertGallery("media-farm", ["hotel-exterior.jpg", "hotel-lounge.jpg"], {
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

  await upsertGallery("media-room-deluxe", ["room-deluxe-1.jpg", "room-deluxe-2.jpg"], {
    roomId: deluxe.id,
  });
  await upsertGallery("media-room-cottage", ["room-twin.jpg"], { roomId: cottage.id });

  const today = todayDateOnly();
  const days = Array.from({ length: 30 }, (_, i) => addDays(today, i));

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
  await seedPlaces();
}
