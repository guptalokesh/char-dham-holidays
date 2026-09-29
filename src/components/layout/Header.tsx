import Link from "next/link";
import Image from "next/image";
import { MobileNav } from "@/components/layout/MobileNav";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/chardham", label: "Chardham" },
  { href: "/trekking", label: "Trekking" },
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
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          {settings.logoMedia ? (
            <Image
              src={settings.logoMedia.url}
              alt={settings.businessName}
              width={140}
              height={48}
              className="h-10 w-auto object-contain"
              priority
            />
          ) : (
            <span className="font-semibold">{settings.businessName}</span>
          )}
        </Link>

        <nav className="hidden gap-6 text-sm font-medium sm:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-zinc-700 hover:text-zinc-950">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden sm:block">
          <Link
            href="/contact"
            className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
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
