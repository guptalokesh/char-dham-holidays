import { prisma } from "@/lib/db";
import { WEBSITE_SETTINGS_ID } from "@/lib/constants";
import {
  websiteSettingsUpdateSchema,
  type WebsiteSettingsUpdateInput,
} from "@/lib/validation/settings";

export async function getWebsiteSettings() {
  return prisma.websiteSettings.upsert({
    where: { id: WEBSITE_SETTINGS_ID },
    update: {},
    create: { id: WEBSITE_SETTINGS_ID },
  });
}

export async function updateWebsiteSettings(input: WebsiteSettingsUpdateInput) {
  const data = websiteSettingsUpdateSchema.parse(input);

  await getWebsiteSettings(); // ensure the singleton row exists first

  return prisma.websiteSettings.update({
    where: { id: WEBSITE_SETTINGS_ID },
    data,
  });
}
