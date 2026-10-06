import { buildWhatsAppUrl } from "@/lib/whatsapp";

const BUTTON =
  "flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-center font-medium text-white shadow-sm transition-colors";

export function ContactActions({
  phone,
  whatsappNumber,
  email,
}: {
  phone: string | null;
  whatsappNumber: string | null;
  email: string | null;
}) {
  let whatsappHref: string | null = null;
  if (whatsappNumber) {
    try {
      whatsappHref = buildWhatsAppUrl(whatsappNumber, "Hello, I would like to plan a journey with you.");
    } catch {
      whatsappHref = null;
    }
  }

  return (
    <div className="space-y-3">
      {whatsappHref && (
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className={`${BUTTON} bg-green-700 hover:bg-green-800`}
        >
          Contact on WhatsApp
        </a>
      )}
      {phone && (
        <a
          href={`tel:${phone.replace(/[^\d+]/g, "")}`}
          className={`${BUTTON} bg-indigo-800 hover:bg-indigo-900`}
        >
          Call us {phone}
        </a>
      )}
      {email && (
        <a href={`mailto:${email}`} className={`${BUTTON} break-all bg-orange-700 hover:bg-orange-800`}>
          Email {email}
        </a>
      )}
    </div>
  );
}
