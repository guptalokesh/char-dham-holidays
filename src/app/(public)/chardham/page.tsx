import type { Metadata } from "next";
import { getChardhamPackage } from "@/lib/chardham";
import { ChardhamPageContent } from "@/components/chardham/ChardhamPageContent";

// Content is admin-editable and must always reflect the latest database
// state rather than being frozen at build time.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Chardham Yatra by Helicopter | Char Dham Holidays",
  description:
    "Chardham Yatra by Helicopter covering Yamunotri, Gangotri, Sri Kedarnath and Badrinath, with stay, food and travel included. Check availability and enquire on WhatsApp.",
  alternates: { canonical: "/chardham" },
  openGraph: {
    title: "Chardham Yatra by Helicopter",
    description:
      "Chardham Yatra by Helicopter covering Yamunotri, Gangotri, Sri Kedarnath and Badrinath.",
    url: "/chardham",
  },
};

export default async function ChardhamPage() {
  const pkg = await getChardhamPackage();

  return <ChardhamPageContent pkg={pkg} />;
}
