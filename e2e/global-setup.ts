import path from "node:path";
import { config } from "dotenv";

config({ path: path.resolve(__dirname, "../.env.e2e"), override: true });

export default async function globalSetup() {
  // Relative imports only: Playwright's TS transform doesn't resolve the
  // "@/" tsconfig path alias, same reason prisma/seed-logic.ts avoids it.
  const { prisma } = await import("../src/lib/db");
  const { runSeed } = await import("../prisma/seed-logic");
  const { WEBSITE_SETTINGS_ID } = await import("../src/lib/constants");

  // Full reset so the acceptance suite is deterministic across reruns —
  // tests like "create a new trek" or "change room price" mutate state that
  // must not leak between runs.
  await prisma.enquiry.deleteMany();
  await prisma.roomAvailability.deleteMany();
  await prisma.room.deleteMany();
  await prisma.farmProperty.deleteMany();
  await prisma.media.deleteMany();
  await prisma.trek.deleteMany();
  await prisma.chardhamPackage.deleteMany();
  await prisma.websiteSettings.deleteMany();
  await prisma.adminUser.deleteMany();

  await runSeed();

  // Seed-shared defaults intentionally leave the WhatsApp number and
  // organiser enquiry email unset (real business info, never invented).
  // The e2e suite needs stable values to assert against.
  await prisma.websiteSettings.update({
    where: { id: WEBSITE_SETTINGS_ID },
    data: {
      whatsappNumber: "+91 98000 00000",
      enquiryEmail: "hello@chardhamholidays.example",
      primaryEmail: "hello@chardhamholidays.example",
    },
  });

  await prisma.$disconnect();
}
