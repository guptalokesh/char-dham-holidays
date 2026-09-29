export function normalizePhoneForWhatsApp(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (!digits) {
    throw new Error("Cannot build a WhatsApp link without a valid phone number.");
  }
  return digits;
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const digits = normalizePhoneForWhatsApp(phone);
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function buildChardhamWhatsAppMessage(params: {
  preferredDate: string;
  travellers: number;
}): string {
  return (
    "Hello, I am interested in Chardham Yatra by Helicopter.\n\n" +
    `Preferred date: ${params.preferredDate}\n` +
    `Number of travellers: ${params.travellers}\n\n` +
    "Please confirm availability and booking details."
  );
}

export function buildTrekWhatsAppMessage(params: {
  trekName: string;
  people: number;
  preferredDate: string;
  requirements: string;
}): string {
  const requirements = params.requirements.trim() || "None";
  return (
    `Hello, I am interested in ${params.trekName}.\n\n` +
    `Number of people: ${params.people}\n` +
    `Preferred date: ${params.preferredDate}\n` +
    `Additional requirements: ${requirements}\n\n` +
    "Please share availability and pricing."
  );
}

export function buildFarmHomeStayWhatsAppMessage(params: {
  roomName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
}): string {
  return (
    "Hello, I would like to book the Farm Home Stay.\n\n" +
    `Room: ${params.roomName}\n` +
    `Check-in: ${params.checkIn}\n` +
    `Check-out: ${params.checkOut}\n` +
    `Guests: ${params.guests}\n\n` +
    "Please confirm availability and booking details."
  );
}
