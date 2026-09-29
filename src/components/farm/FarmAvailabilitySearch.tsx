"use client";

import { useState } from "react";
import { formatInr } from "@/lib/format";

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

interface RoomResult {
  id: string;
  name: string;
  price: number;
  capacity: number;
  images: { url: string }[];
}

export function FarmAvailabilitySearch() {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("1");
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [rooms, setRooms] = useState<RoomResult[] | null>(null);

  const [bookingRoomId, setBookingRoomId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingConfirmed, setBookingConfirmed] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function validateSearch(): string | null {
    if (!checkIn || !checkOut) return "Check-in and check-out dates are required.";
    if (checkIn < todayIsoDate()) return "Check-in cannot be in the past.";
    if (checkOut <= checkIn) return "Check-out must be after check-in.";
    const guestCount = Number(guests);
    if (!Number.isInteger(guestCount) || guestCount < 1) {
      return "Enter a valid number of guests.";
    }
    return null;
  }

  async function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    setSearchError(null);
    setRooms(null);
    setBookingRoomId(null);
    setBookingConfirmed(null);

    const validationError = validateSearch();
    if (validationError) {
      setSearchError(validationError);
      return;
    }

    setSearching(true);
    try {
      const response = await fetch("/api/farm/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkIn, checkOut, guests: Number(guests) }),
      });
      const data = await response.json();

      if (!response.ok) {
        setSearchError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setRooms(data.rooms);
    } catch {
      setSearchError("Something went wrong. Please try again.");
    } finally {
      setSearching(false);
    }
  }

  async function handleBookingSubmit(event: React.FormEvent, room: RoomResult) {
    event.preventDefault();
    setBookingError(null);

    if (!name.trim() || !phone.trim()) {
      setBookingError("Name and phone are required.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/farm/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: room.id,
          name,
          phone,
          checkIn,
          checkOut,
          guests: Number(guests),
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setBookingError(data.error ?? "Something went wrong. Please try again or contact us on WhatsApp.");
        return;
      }

      setBookingConfirmed(room.id);
      if (data.whatsappUrl) {
        window.open(data.whatsappUrl, "_blank", "noopener,noreferrer");
      }
    } catch {
      setBookingError("Something went wrong. Please try again or contact us on WhatsApp.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <form onSubmit={handleSearch} className="grid grid-cols-1 gap-4 sm:grid-cols-4" noValidate>
        <div className="space-y-1">
          <label htmlFor="farm-checkin" className="block text-sm font-medium">
            Check-in
          </label>
          <input
            id="farm-checkin"
            type="date"
            required
            min={todayIsoDate()}
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="w-full rounded border border-zinc-300 px-3 py-2"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="farm-checkout" className="block text-sm font-medium">
            Check-out
          </label>
          <input
            id="farm-checkout"
            type="date"
            required
            min={todayIsoDate()}
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="w-full rounded border border-zinc-300 px-3 py-2"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="farm-guests" className="block text-sm font-medium">
            Guests
          </label>
          <input
            id="farm-guests"
            type="number"
            min={1}
            max={20}
            required
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            className="w-full rounded border border-zinc-300 px-3 py-2"
          />
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={searching}
            className="w-full rounded bg-green-800 px-4 py-2 text-white disabled:opacity-50"
          >
            {searching ? "Searching..." : "Search"}
          </button>
        </div>
      </form>

      {searchError && (
        <p role="alert" className="mt-3 text-sm text-red-600">
          {searchError}
        </p>
      )}

      {rooms && rooms.length === 0 && (
        <p className="mt-6 text-zinc-600">
          No rooms available for the selected dates and guest count. Please try
          different dates or contact us directly.
        </p>
      )}

      {rooms && rooms.length > 0 && (
        <div
          data-testid="farm-search-results"
          className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
          {rooms.map((room) => (
            <div key={room.id} className="rounded-lg border border-green-100 p-4">
              <h3 className="text-lg font-semibold">{room.name}</h3>
              <p className="text-sm text-zinc-600">Up to {room.capacity} guests</p>
              <p className="mt-1 font-medium text-green-800">
                {formatInr(room.price)} <span className="text-sm text-zinc-500">/ night</span>
              </p>

              {bookingRoomId === room.id ? (
                bookingConfirmed === room.id ? (
                  <p className="mt-3 text-sm text-green-700">
                    We&apos;ve received your request and will confirm availability and
                    booking details shortly.
                  </p>
                ) : (
                  <form
                    onSubmit={(e) => handleBookingSubmit(e, room)}
                    className="mt-3 space-y-2"
                    noValidate
                  >
                    <div className="space-y-1">
                      <label htmlFor={`name-${room.id}`} className="block text-sm font-medium">
                        Name
                      </label>
                      <input
                        id={`name-${room.id}`}
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full rounded border border-zinc-300 px-3 py-2"
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor={`phone-${room.id}`} className="block text-sm font-medium">
                        Phone
                      </label>
                      <input
                        id={`phone-${room.id}`}
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full rounded border border-zinc-300 px-3 py-2"
                      />
                    </div>
                    {bookingError && (
                      <p role="alert" className="text-sm text-red-600">
                        {bookingError}
                      </p>
                    )}
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full rounded bg-green-800 px-4 py-2 text-white disabled:opacity-50"
                    >
                      {submitting ? "Sending..." : "Request Booking"}
                    </button>
                  </form>
                )
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setBookingRoomId(room.id);
                    setBookingError(null);
                  }}
                  className="mt-3 w-full rounded border border-green-800 px-4 py-2 text-green-800"
                >
                  Book Now
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
