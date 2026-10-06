import type { ReactNode } from "react";
import type { Metadata } from "next";
import { getWebsiteSettings } from "@/lib/settings";
import { listPackages } from "@/lib/packages";
import { Header } from "@/components/layout/Header";
import { OfferPopup } from "@/components/layout/OfferPopup";
import { Footer } from "@/components/layout/Footer";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getWebsiteSettings();
  return {
    title: {
      default: settings.businessName,
      template: `%s | ${settings.businessName}`,
    },
    description:
      settings.shortDescription ?? settings.heroDescription ?? undefined,
  };
}

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const [settings, yatras] = await Promise.all([getWebsiteSettings(), listPackages()]);

  const priceOf = (slug: string) => yatras.find((y) => y.slug === slug)?.price ?? null;

  return (
    <>
      <Header settings={settings} />
      <div className="flex-1">{children}</div>
      <Footer settings={settings} yatras={yatras.map(({ slug, name }) => ({ slug, name }))} />
      {process.env.OFFER_POPUP !== "off" && (
        <OfferPopup charDhamPrice={priceOf("char-dham")} anyDhamPrice={priceOf("any-dham")} />
      )}
    </>
  );
}
