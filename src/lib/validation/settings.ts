import { z } from "zod";

const PHONE_REGEX = /^\+?[0-9 ()-]{7,20}$/;
const HEX_COLOR_REGEX = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

function emptyToNull(value: unknown) {
  return value === "" ? null : value;
}

const plainText = (maxLength: number) =>
  z.preprocess(emptyToNull, z.string().trim().max(maxLength).nullable().optional());

const emailField = () =>
  z.preprocess(emptyToNull, z.email("Enter a valid email address").nullable().optional());

const urlField = () =>
  z.preprocess(emptyToNull, z.url("Enter a valid URL").nullable().optional());

const phoneField = () =>
  z.preprocess(
    emptyToNull,
    z
      .string()
      .regex(PHONE_REGEX, "Enter a valid phone number")
      .nullable()
      .optional()
  );

const hexColorField = () =>
  z
    .string()
    .regex(HEX_COLOR_REGEX, "Enter a valid hex color (e.g. #1B4B66)")
    .optional();

export const websiteSettingsUpdateSchema = z.object({
  businessName: z.string().trim().min(1).max(200).optional(),
  shortDescription: plainText(1000),
  addressLine: plainText(300),
  city: plainText(100),
  state: plainText(100),
  country: plainText(100),
  mapLink: urlField(),

  primaryPhone: phoneField(),
  secondaryPhone: phoneField(),
  whatsappNumber: phoneField(),
  primaryEmail: emailField(),
  enquiryEmail: emailField(),

  instagramUrl: urlField(),
  facebookUrl: urlField(),
  youtubeUrl: urlField(),
  otherSocialUrl: urlField(),

  primaryColor: hexColorField(),
  secondaryColor: hexColorField(),
  trekkingAccentColor: hexColorField(),

  heroHeading: plainText(200),
  heroDescription: plainText(500),
  chardhamCtaLabel: plainText(60),
  trekkingCtaLabel: plainText(60),
  whatsappCtaText: plainText(60),
  contactCtaText: plainText(60),
  footerCopyrightText: plainText(200),
});

export type WebsiteSettingsUpdateInput = z.infer<typeof websiteSettingsUpdateSchema>;
