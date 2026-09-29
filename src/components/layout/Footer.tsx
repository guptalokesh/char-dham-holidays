import Link from "next/link";
import Image from "next/image";
import { WhatsAppCta } from "@/components/layout/WhatsAppCta";

export interface FooterSettings {
  businessName: string;
  whatsappNumber: string | null;
  primaryPhone: string | null;
  primaryEmail: string | null;
  addressLine: string | null;
  city: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  youtubeUrl: string | null;
  otherSocialUrl: string | null;
  footerCopyrightText: string | null;
  whatsappCtaText: string | null;
  logoMedia: { url: string } | null;
}

const SOCIAL_LINKS: { key: keyof FooterSettings; label: string }[] = [
  { key: "instagramUrl", label: "Instagram" },
  { key: "facebookUrl", label: "Facebook" },
  { key: "youtubeUrl", label: "YouTube" },
  { key: "otherSocialUrl", label: "Social" },
];

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/chardham", label: "Chardham" },
  { href: "/trekking", label: "Trekking" },
  { href: "/farm-home-stay", label: "Farm Home Stay" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Footer({ settings }: { settings: FooterSettings }) {
  const year = new Date().getFullYear();
  const socialLinks = SOCIAL_LINKS.filter((link) => settings[link.key]);

  return (
    <footer className="bg-stone-900 text-stone-300">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
          <div>
            {settings.logoMedia ? (
              <div className="inline-block rounded-lg bg-white p-2">
                <Image
                  src={settings.logoMedia.url}
                  alt={settings.businessName}
                  width={140}
                  height={48}
                  className="h-9 w-auto object-contain"
                />
              </div>
            ) : (
              <p className="text-lg font-semibold text-white">{settings.businessName}</p>
            )}
            <p className="mt-3 max-w-xs text-sm text-stone-400">
              Spiritual journeys, mountain treks and peaceful stays in
              Uttarakhand.
            </p>
          </div>

          <nav className="flex flex-col gap-2 text-sm">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="w-fit text-stone-300 transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="min-w-0 space-y-1.5 text-sm text-stone-300 break-words">
            {settings.primaryPhone && <p>{settings.primaryPhone}</p>}
            {settings.primaryEmail && <p>{settings.primaryEmail}</p>}
            {settings.addressLine && (
              <p>
                {settings.addressLine}
                {settings.city ? `, ${settings.city}` : ""}
              </p>
            )}
            <WhatsAppCta
              phone={settings.whatsappNumber}
              message="Hello, I would like to know more about Char Dham Holidays."
              label={settings.whatsappCtaText ?? "Chat on WhatsApp"}
              className="mt-3 inline-flex items-center gap-1.5 font-medium text-green-400 transition-colors hover:text-green-300"
            />
          </div>
        </div>

        {socialLinks.length > 0 && (
          <div className="mt-8 flex gap-5 text-sm">
            {socialLinks.map((link) => (
              <a
                key={link.key}
                href={settings[link.key] as string}
                target="_blank"
                rel="noopener noreferrer"
                className="text-stone-400 transition-colors hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </div>
        )}

        <div className="mt-10 flex flex-col gap-3 border-t border-stone-800 pt-6 text-sm text-stone-500 sm:flex-row sm:items-center sm:justify-between">
          <p>{settings.footerCopyrightText ?? `© ${year} ${settings.businessName}. All rights reserved.`}</p>
          <div className="flex gap-5">
            <Link href="/privacy-policy" className="hover:text-stone-300">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-stone-300">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
