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
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Contact Us</h1>
      <p className="mt-2 text-zinc-600">
        Send us an enquiry and our team will get back to you directly to discuss
        details.
      </p>

      <div className="mt-6 space-y-1 text-sm text-zinc-600">
        {settings.primaryPhone && <p>Phone: {settings.primaryPhone}</p>}
        {settings.primaryEmail && <p>Email: {settings.primaryEmail}</p>}
        {settings.addressLine && (
          <p>
            {settings.addressLine}
            {settings.city ? `, ${settings.city}` : ""}
          </p>
        )}
      </div>

      <div className="mt-8">
        <GeneralEnquiryForm serviceOptions={serviceOptions} />
      </div>
    </main>
  );
}
