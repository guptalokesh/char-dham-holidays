import Link from "next/link";
import Image from "next/image";
import { MobileNav } from "@/components/layout/MobileNav";

const NAV_LINKS = [
  { href: "/", label: "Home", tone: "bg-blue-700 hover:bg-blue-600" },
  { href: "/yatra", label: "Char Dham Yatra", tone: "bg-amber-700 hover:bg-amber-600" },
  {
    href: "/yatra/yamunotri-gangotri-handling",
    label: "Aircraft Handling Service",
    tone: "bg-sky-700 hover:bg-sky-600",
  },
  { href: "/trekking", label: "Trekking", tone: "bg-emerald-700 hover:bg-emerald-600" },
  {
    href: "/farm-home-stay",
    label: "Farm Stay / Wellness Centre",
    tone: "bg-teal-700 hover:bg-teal-600",
  },
  { href: "/about", label: "About Us", tone: "bg-violet-700 hover:bg-violet-600" },
  { href: "/contact", label: "Contact", tone: "bg-rose-700 hover:bg-rose-600" },
];

export interface HeaderSettings {
  businessName: string;
  logoMedia: { url: string } | null;
}

const PRIMARY_CTA_LABEL = "Check Availability";

export function Header({ settings }: { settings: HeaderSettings }) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-gradient-to-r from-blue-950 via-indigo-900 to-rose-900 shadow-md">
      <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3.5">
        <Link href="/" className="flex items-center gap-2.5 rounded-lg bg-white/95 px-2 py-0.5">
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

        <nav className="hidden flex-wrap justify-end gap-1.5 text-sm font-medium text-white xl:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-full px-3.5 py-1.5 shadow-sm transition-colors ${link.tone}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden 2xl:block">
          <Link
            href="/contact"
            className="rounded-full bg-amber-400 px-5 py-2.5 text-sm font-semibold text-stone-950 shadow-sm transition-all hover:bg-amber-300 hover:shadow-md"
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
