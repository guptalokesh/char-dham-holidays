import type { Metadata } from "next";
import { getWebsiteSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Char Dham Holidays collects, uses and protects your information.",
  alternates: { canonical: "/privacy-policy" },
};

export default async function PrivacyPolicyPage() {
  const settings = await getWebsiteSettings();
  const contactEmail = settings.enquiryEmail ?? settings.primaryEmail;

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Privacy Policy</h1>
      <p className="mt-2 text-sm text-zinc-500">
        This policy explains how {settings.businessName} handles information
        submitted through this website.
      </p>

      <section className="mt-8 space-y-4 text-zinc-700">
        <h2 className="text-lg font-semibold">Information we collect</h2>
        <p>
          When you submit an enquiry, availability check or booking request
          form, we collect the information you provide — typically your name,
          phone number, email address, and any message or preferences you
          share (such as preferred dates, number of travellers or guests).
        </p>

        <h2 className="text-lg font-semibold">How we use it</h2>
        <p>
          We use this information only to respond to your enquiry, check and
          confirm availability, and contact you — by phone, email or WhatsApp —
          to discuss your booking, itinerary and payment details. We do not
          sell or rent your information to third parties.
        </p>

        <h2 className="text-lg font-semibold">WhatsApp</h2>
        <p>
          Several forms on this site open a WhatsApp conversation with our
          team using the details you entered. Messages sent over WhatsApp are
          subject to WhatsApp&apos;s own privacy practices.
        </p>

        <h2 className="text-lg font-semibold">Data retention and access</h2>
        <p>
          Enquiry and booking-request information is retained so our team can
          follow up with you and maintain a record of past communications. It
          is accessible only to authorised administrators of this website.
        </p>

        {contactEmail && (
          <>
            <h2 className="text-lg font-semibold">Contact us</h2>
            <p>
              If you have questions about how your information is handled,
              please contact us at {contactEmail}.
            </p>
          </>
        )}
      </section>
    </main>
  );
}
