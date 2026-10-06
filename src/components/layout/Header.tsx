import Link from "next/link";
import Image from "next/image";
import { NavLinks } from "@/components/layout/NavLinks";
import { MobileNav } from "@/components/layout/MobileNav";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/yatra", label: "Char Dham Yatra", accent: true },
  { href: "/yatra/yamunotri-gangotri-handling", label: "Aircraft Handling Service" },
  { href: "/trekking", label: "Trekking" },
  { href: "/farm-home-stay", label: "Farm Stay / Wellness Centre" },
  { href: "/contact", label: "About Us & Contact" },
];

export interface HeaderSettings {
  businessName: string;
  logoMedia: { url: string } | null;
}

const PRIMARY_CTA_LABEL = "Check Availability";

export function Header({ settings }: { settings: HeaderSettings }) {
  return (
    <header className="sticky top-0 z-40 border-b-2 border-amber-500 bg-[#fdfbf7] shadow-sm">
      <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3.5">
        <Link href="/" className="flex items-center gap-2.5">
          {settings.logoMedia ? (
            <Image
              src={settings.logoMedia.url}
              alt={settings.businessName}
              width={200}
              height={84}
              className="h-14 w-auto object-contain sm:h-16"
              priority
            />
          ) : (
            <span className="text-lg font-semibold tracking-tight text-stone-900">
              {settings.businessName}
            </span>
          )}
        </Link>

        <nav className="hidden flex-wrap justify-end gap-1 xl:flex">
          <NavLinks links={NAV_LINKS} />
        </nav>

        <div className="hidden 2xl:block">
          <Link
            href="/contact"
            className="rounded-full bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-stone-800 hover:shadow-md"
          >
            {PRIMARY_CTA_LABEL}
          </Link>
        </div>

        <MobileNav
          links={NAV_LINKS}
          cta={{ href: "/contact", label: PRIMARY_CTA_LABEL }}
        />
      </div>
    </header>
  );
}
