import type { Metadata } from "next";
import { getEnquiryServiceOptions } from "@/lib/enquiry";
import { getWebsiteSettings } from "@/lib/settings";
import { GeneralEnquiryForm } from "@/components/enquiry/GeneralEnquiryForm";

// Service options (active treks) and contact details are admin-editable.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact Us | Char Dham Holidays",
  description:
    "Send us an enquiry about Chardham Yatra by Helicopter, trekking or Farm Home Stay, or reach us directly by phone, email or WhatsApp.",
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
          Get in touch
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
          Contact Us
        </h1>
        <p className="mt-3 text-stone-600">
          Send us an enquiry and our team will get back to you directly to discuss
          details.
        </p>

        {(settings.primaryPhone || settings.primaryEmail || settings.addressLine) && (
          <div className="mt-6 space-y-1 break-words rounded-xl border border-stone-200 bg-white p-5 text-sm text-stone-600">
            {settings.primaryPhone && <p>Phone: {settings.primaryPhone}</p>}
            {settings.primaryEmail && <p>Email: {settings.primaryEmail}</p>}
            {settings.addressLine && (
              <p>
                {settings.addressLine}
                {settings.city ? `, ${settings.city}` : ""}
              </p>
            )}
          </div>
        )}

        <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
          <GeneralEnquiryForm serviceOptions={serviceOptions} />
        </div>
      </div>
    </main>
  );
}
