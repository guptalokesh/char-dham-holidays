import Link from "next/link";
import Image from "next/image";
import { MobileNav } from "@/components/layout/MobileNav";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/chardham", label: "Chardham" },
  { href: "/trekking", label: "Trekking" },
  { href: "/devrana-mandir", label: "Devrana" },
  { href: "/farm-home-stay", label: "Farm Home Stay" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export interface HeaderSettings {
  businessName: string;
  logoMedia: { url: string } | null;
}

const PRIMARY_CTA_LABEL = "Check Availability";

export function Header({ settings }: { settings: HeaderSettings }) {
  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-[#fdfbf7]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3.5">
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

        <nav className="hidden gap-8 text-[15px] font-medium text-stone-600 sm:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative py-1 transition-colors after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:origin-left after:scale-x-0 after:bg-amber-600 after:transition-transform hover:text-stone-950 hover:after:scale-x-100"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden sm:block">
          <Link
            href="/contact"
            className="rounded-full bg-stone-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-stone-800 hover:shadow-md"
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
