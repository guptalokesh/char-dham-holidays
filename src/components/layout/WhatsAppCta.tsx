import { buildWhatsAppUrl } from "@/lib/whatsapp";

export function WhatsAppCta({
  phone,
  message,
  label,
  className,
}: {
  phone: string | null;
  message: string;
  label: string;
  className?: string;
}) {
  if (!phone) {
    return null;
  }

  let href: string;
  try {
    href = buildWhatsAppUrl(phone, message);
  } catch {
    return null;
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={
        className ??
        "inline-block rounded bg-green-700 px-4 py-2 text-white hover:bg-green-800"
      }
    >
      {label}
    </a>
  );
}
