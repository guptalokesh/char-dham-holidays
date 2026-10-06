import type { Metadata } from "next";
import { getEnquiryServiceOptions } from "@/lib/enquiry";
import { getWebsiteSettings } from "@/lib/settings";
import { ContactActions } from "@/components/contact/ContactActions";
import { AboutIntro } from "@/components/contact/AboutIntro";
import { GeneralEnquiryForm } from "@/components/enquiry/GeneralEnquiryForm";

// Service options (active treks) and contact details are admin-editable.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About Us & Contact | Char Dham Holidays",
  description:
    "About Char Dham Holidays, and how to reach us. Send us an enquiry about a helicopter yatra, a trek or the Farm Home Stay, or reach us directly by phone, email or WhatsApp.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const [serviceOptions, settings] = await Promise.all([
    getEnquiryServiceOptions(),
    getWebsiteSettings(),
  ]);

  return (
    <main className="bg-gradient-to-b from-stone-50 to-transparent">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
          About us
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
          About Us &amp; Contact
        </h1>
        <AboutIntro businessName={settings.businessName} shortDescription={settings.shortDescription} />

        <div className="mt-14 border-t border-stone-200 pt-12">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
          Get in touch
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">
          Plan your journey with us
        </h2>
        <p className="mt-3 text-stone-600">
          Reach our team in the way that suits you, or send an enquiry below and we
          will get back to you directly.
        </p>

        <div className="mt-6">
          <ContactActions
            phone={settings.primaryPhone}
            whatsappNumber={settings.whatsappNumber}
            email={settings.primaryEmail}
          />
        </div>

        {settings.addressLine && (
          <p className="mt-4 break-words text-sm text-stone-600">
            {settings.addressLine}
            {settings.city ? `, ${settings.city}` : ""}{settings.state ? `, ${settings.state}` : ""}
          </p>
        )}

        <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
          <GeneralEnquiryForm serviceOptions={serviceOptions} />
        </div>
        </div>
      </div>
    </main>
  );
}
