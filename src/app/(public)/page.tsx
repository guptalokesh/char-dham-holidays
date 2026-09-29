import { getWebsiteSettings } from "@/lib/settings";
import { getChardhamPackage } from "@/lib/chardham";
import { HomePageContent } from "@/components/home/HomePageContent";

// Hero copy, CTA labels and the WhatsApp number are all admin-editable.
export const dynamic = "force-dynamic";

export default async function Home() {
  const [settings, chardhamPackage] = await Promise.all([
    getWebsiteSettings(),
    getChardhamPackage(),
  ]);

  return (
    <HomePageContent
      heroHeading={settings.heroHeading ?? "Explore Uttarakhand"}
      heroDescription={
        settings.heroDescription ??
        "Spiritual journeys, mountain treks and peaceful stays."
      }
      chardhamCtaLabel={settings.chardhamCtaLabel ?? "Explore Chardham"}
      trekkingCtaLabel={settings.trekkingCtaLabel ?? "Explore Treks"}
      chardhamPrice={chardhamPackage.price}
      whatsappNumber={settings.whatsappNumber}
      whatsappCtaText={settings.whatsappCtaText ?? "Chat on WhatsApp"}
      contactCtaText={settings.contactCtaText ?? "Send an Enquiry"}
    />
  );
}
