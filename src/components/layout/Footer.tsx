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

export function Footer({ settings }: { settings: FooterSettings }) {
  const year = new Date().getFullYear();
  const socialLinks = SOCIAL_LINKS.filter((link) => settings[link.key]);

  return (
    <footer className="border-t border-zinc-200 bg-zinc-50">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div>
            {settings.logoMedia ? (
              <Image
                src={settings.logoMedia.url}
                alt={settings.businessName}
                width={140}
                height={48}
                className="h-10 w-auto object-contain"
              />
            ) : (
              <p className="font-semibold">{settings.businessName}</p>
            )}
          </div>

          <nav className="flex flex-col gap-1 text-sm">
            <Link href="/">Home</Link>
            <Link href="/chardham">Chardham</Link>
            <Link href="/trekking">Trekking</Link>
            <Link href="/farm-home-stay">Farm Home Stay</Link>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
          </nav>

          <div className="space-y-1 text-sm text-zinc-600">
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
              className="mt-2 inline-block text-green-800 underline"
            />
          </div>
        </div>

        {socialLinks.length > 0 && (
          <div className="mt-6 flex gap-4 text-sm">
            {socialLinks.map((link) => (
              <a
                key={link.key}
                href={settings[link.key] as string}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-600 hover:text-zinc-900"
              >
                {link.label}
              </a>
            ))}
          </div>
        )}

        <div className="mt-8 flex flex-col gap-2 border-t border-zinc-200 pt-6 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
          <p>{settings.footerCopyrightText ?? `© ${year} ${settings.businessName}. All rights reserved.`}</p>
          <div className="flex gap-4">
            <Link href="/privacy-policy">Privacy Policy</Link>
            <Link href="/terms">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
