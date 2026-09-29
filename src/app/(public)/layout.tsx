import type { ReactNode } from "react";
import type { Metadata } from "next";
import { getWebsiteSettings } from "@/lib/settings";
import { Header } from "@/components/layout/Header";
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
  const settings = await getWebsiteSettings();

  return (
    <>
      <Header settings={settings} />
      <div className="flex-1">{children}</div>
      <Footer settings={settings} />
    </>
  );
}
