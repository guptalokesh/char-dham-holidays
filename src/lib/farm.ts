import { prisma } from "@/lib/db";
import { FARM_PROPERTY_ID } from "@/lib/constants";
import { UserFacingError } from "@/lib/errors";
import { addDays, formatDateOnly, getNightsBetween, parseDateOnly, todayDateOnly } from "@/lib/date-utils";
import { getWebsiteSettings } from "@/lib/settings";
import { buildFarmHomeStayWhatsAppMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import {
  farmBookingRequestSchema,
  farmPropertyUpdateSchema,
  farmSearchSchema,
  roomAvailabilityBulkSchema,
  roomCreateSchema,
  roomUpdateSchema,
  type FarmBookingRequestInput,
  type FarmPropertyUpdateInput,
  type FarmSearchInput,
  type RoomAvailabilityBulkInput,
  type RoomCreateInput,
  type RoomUpdateInput,
} from "@/lib/validation/farm";

const BLOCKING_STATUSES = ["BOOKED", "UNAVAILABLE"] as const;

export async function getFarmProperty() {
  return prisma.farmProperty.upsert({
    where: { id: FARM_PROPERTY_ID },
    update: {},
    create: { id: FARM_PROPERTY_ID, description: "" },
    include: { images: true, rooms: { include: { images: true } } },
  });
}

export async function updateFarmProperty(input: FarmPropertyUpdateInput) {
  const data = farmPropertyUpdateSchema.parse(input);
  await getFarmProperty();
  return prisma.farmProperty.update({
    where: { id: FARM_PROPERTY_ID },
    data,
    include: { images: true, rooms: { include: { images: true } } },
  });
}

export async function createRoom(input: RoomCreateInput) {
  const data = roomCreateSchema.parse(input);
  await getFarmProperty();
  return prisma.room.create({
    data: {
      farmPropertyId: FARM_PROPERTY_ID,
      name: data.name,
      price: data.price,
      capacity: data.capacity,
      amenities: data.amenities ?? undefined,
    },
  });
}

export async function updateRoom(id: string, input: RoomUpdateInput) {
  const data = roomUpdateSchema.parse(input);
  return prisma.room.update({ where: { id }, data, include: { images: true } });
}

export async function listRooms(options?: { activeOnly?: boolean }) {
  const activeOnly = options?.activeOnly ?? false;
  return prisma.room.findMany({
    where: activeOnly ? { active: true } : undefined,
    include: { images: true },
    orderBy: { price: "asc" },
  });
}

export async function setRoomAvailability(input: RoomAvailabilityBulkInput) {
  const data = roomAvailabilityBulkSchema.parse(input);

  await prisma.$transaction(
    data.dates.map((dateStr) =>
      prisma.roomAvailability.upsert({
        where: { roomId_date: { roomId: data.roomId, date: parseDateOnly(dateStr) } },
        update: { status: data.status },
        create: { roomId: data.roomId, date: parseDateOnly(dateStr), status: data.status },
      })
    )
  );

  return prisma.roomAvailability.findMany({
    where: { roomId: data.roomId, date: { in: data.dates.map(parseDateOnly) } },
    orderBy: { date: "asc" },
  });
}

export interface RoomAvailabilityGridRow {
  id: string;
  name: string;
  active: boolean;
  days: { date: string; status: "AVAILABLE" | "BOOKED" | "UNAVAILABLE" }[];
}

export async function getRoomAvailabilityGrid(days = 14): Promise<RoomAvailabilityGridRow[]> {
  const rooms = await prisma.room.findMany({ orderBy: { price: "asc" } });
  const today = todayDateOnly();
  const dates = Array.from({ length: days }, (_, i) => addDays(today, i));

  const records = await prisma.roomAvailability.findMany({
    where: { roomId: { in: rooms.map((r) => r.id) }, date: { in: dates } },
  });
  const byRoomAndDate = new Map(
    records.map((r) => [`${r.roomId}:${formatDateOnly(r.date)}`, r.status])
  );

  return rooms.map((room) => ({
    id: room.id,
    name: room.name,
    active: room.active,
    days: dates.map((date) => {
      const key = `${room.id}:${formatDateOnly(date)}`;
      return { date: formatDateOnly(date), status: byRoomAndDate.get(key) ?? "AVAILABLE" };
    }),
  }));
}

export async function searchAvailableRooms(input: FarmSearchInput) {
  const data = farmSearchSchema.parse(input);
  const nights = getNightsBetween(data.checkIn, data.checkOut);

  const candidateRooms = await prisma.room.findMany({
    where: { active: true, capacity: { gte: data.guests } },
    include: { images: true },
    orderBy: { price: "asc" },
  });

  if (candidateRooms.length === 0 || nights.length === 0) {
    return [];
  }

  const blockedRecords = await prisma.roomAvailability.findMany({
    where: {
      roomId: { in: candidateRooms.map((room) => room.id) },
      date: { in: nights },
      status: { in: [...BLOCKING_STATUSES] },
    },
    select: { roomId: true },
  });
  const blockedRoomIds = new Set(blockedRecords.map((record) => record.roomId));

  return candidateRooms.filter((room) => !blockedRoomIds.has(room.id));
}

export interface FarmBookingResult {
  whatsappUrl: string | null;
}

export async function submitFarmBookingRequest(
  input: FarmBookingRequestInput
): Promise<FarmBookingResult> {
  const data = farmBookingRequestSchema.parse(input);

  const availableRooms = await searchAvailableRooms({
    checkIn: data.checkIn,
    checkOut: data.checkOut,
    guests: data.guests,
  });
  const room = availableRooms.find((r) => r.id === data.roomId);
  if (!room) {
    throw new UserFacingError("This room is no longer available for the selected dates.");
  }

  await prisma.enquiry.create({
    data: {
      name: data.name,
      phone: data.phone,
      service: "FARM_HOME_STAY",
      roomId: room.id,
      details: { checkIn: data.checkIn, checkOut: data.checkOut, guests: data.guests },
    },
  });

  const settings = await getWebsiteSettings();
  if (!settings.whatsappNumber) {
    return { whatsappUrl: null };
  }

  const message = buildFarmHomeStayWhatsAppMessage({
    roomName: room.name,
    checkIn: data.checkIn,
    checkOut: data.checkOut,
    guests: data.guests,
  });

  return { whatsappUrl: buildWhatsAppUrl(settings.whatsappNumber, message) };
}
