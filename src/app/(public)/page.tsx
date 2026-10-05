import { getWebsiteSettings } from "@/lib/settings";
import { listPackages, parseSteps } from "@/lib/packages";
import { listTreks } from "@/lib/trek";
import { getFarmProperty } from "@/lib/farm";
import { getPlaceBySlug } from "@/lib/place";
import { HomePageContent } from "@/components/home/HomePageContent";

// Hero copy, CTA labels and the WhatsApp number are all admin-editable.
export const dynamic = "force-dynamic";

export default async function Home() {
  const [settings, yatras, treks, farmProperty, devrana] = await Promise.all([
    getWebsiteSettings(),
    listPackages(),
    listTreks(),
    getFarmProperty(),
    getPlaceBySlug("devrana-mandir"),
  ]);

  const charDham = yatras.find((yatra) => yatra.slug === "char-dham");
  const charDhamSteps = parseSteps(charDham?.steps);

  return (
    <HomePageContent
      heroHeading={settings.heroHeading ?? "Visit the Char Dham by Helicopter"}
      heroDescription={
        settings.heroDescription ??
        "Fly to Yamunotri, Gangotri, Kedarnath and Badrinath, and spend your time on darshan, not on the road."
      }
      chardhamCtaLabel={settings.chardhamCtaLabel ?? "Explore Char Dham"}
      trekkingCtaLabel={settings.trekkingCtaLabel ?? "Explore Treks"}
      chardhamPrice={charDham?.price ?? null}
      whatsappNumber={settings.whatsappNumber}
      whatsappCtaText={settings.whatsappCtaText ?? "Chat on WhatsApp"}
      contactCtaText={settings.contactCtaText ?? "Send an Enquiry"}
      yatras={yatras.map(({ slug, name, tagline, price, images }) => ({ slug, name, tagline, price, images }))}
      dhams={charDhamSteps
        .filter((step) => step.featured)
        .map(({ title, description, imageUrl }) => ({ title, description, imageUrl }))}
      journey={charDhamSteps.map((step) => step.title)}
      inclusions={charDham?.inclusions ?? []}
      trekImageUrl={treks[0]?.images[0]?.url}
      farmImageUrl={farmProperty.images[0]?.url}
      devrana={
        devrana?.active
          ? { title: devrana.title, summary: devrana.summary, imageUrl: devrana.images[0]?.url }
          : null
      }
    />
  );
}
