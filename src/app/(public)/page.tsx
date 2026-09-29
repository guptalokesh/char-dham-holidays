import { getWebsiteSettings } from "@/lib/settings";
import { getChardhamPackage } from "@/lib/chardham";
import { listTreks } from "@/lib/trek";
import { getFarmProperty } from "@/lib/farm";
import { HomePageContent } from "@/components/home/HomePageContent";

// Hero copy, CTA labels and the WhatsApp number are all admin-editable.
export const dynamic = "force-dynamic";

export default async function Home() {
  const [settings, chardhamPackage, treks, farmProperty] = await Promise.all([
    getWebsiteSettings(),
    getChardhamPackage(),
    listTreks(),
    getFarmProperty(),
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
      chardhamImageUrl={chardhamPackage.images[0]?.url}
      trekImageUrl={treks[0]?.images[0]?.url}
      farmImageUrl={farmProperty.images[0]?.url}
    />
  );
}
