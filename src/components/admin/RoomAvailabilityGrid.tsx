"use client";

import { useState } from "react";

type Status = "AVAILABLE" | "BOOKED" | "UNAVAILABLE";

const NEXT_STATUS: Record<Status, Status> = {
  AVAILABLE: "BOOKED",
  BOOKED: "UNAVAILABLE",
  UNAVAILABLE: "AVAILABLE",
};

const STATUS_STYLES: Record<Status, string> = {
  AVAILABLE: "bg-green-100 text-green-800",
  BOOKED: "bg-amber-100 text-amber-800",
  UNAVAILABLE: "bg-red-100 text-red-800",
};

interface RoomRow {
  id: string;
  name: string;
  active: boolean;
  days: { date: string; status: Status }[];
}

export function RoomAvailabilityGrid({ initial }: { initial: RoomRow[] }) {
  const [rooms, setRooms] = useState(initial);
  const [error, setError] = useState<string | null>(null);

  async function handleCellClick(roomId: string, date: string, current: Status) {
    const next = NEXT_STATUS[current];
    setError(null);

    setRooms((prev) =>
      prev.map((room) =>
        room.id === roomId
          ? { ...room, days: room.days.map((d) => (d.date === date ? { ...d, status: next } : d)) }
          : room
      )
    );

    try {
      const response = await fetch(`/api/admin/farm/rooms/${roomId}/availability`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dates: [date], status: next }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.error ?? "Failed to update availability.");
        setRooms((prev) =>
          prev.map((room) =>
            room.id === roomId
              ? {
                  ...room,
                  days: room.days.map((d) => (d.date === date ? { ...d, status: current } : d)),
                }
              : room
          )
        );
      }
    } catch {
      setError("Failed to update availability.");
    }
  }

  if (rooms.length === 0) {
    return <p className="text-zinc-500">No rooms to display yet.</p>;
  }

  const dates = rooms[0].days.map((d) => d.date);

  return (
    <div>
      {error && (
        <p role="alert" className="mb-2 text-sm text-red-600">
          {error}
        </p>
      )}
      <p className="mb-2 text-xs text-zinc-500">
        Click a date to cycle: Available → Booked → Unavailable → Available.
      </p>
      <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
        <table className="min-w-full divide-y divide-zinc-200 text-xs">
          <thead>
            <tr>
              <th className="sticky left-0 bg-white px-3 py-2 text-left">Room</th>
              {dates.map((date) => (
                <th key={date} className="px-2 py-2 text-center font-medium text-zinc-500">
                  {date.slice(5)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {rooms.map((room) => (
              <tr key={room.id}>
                <td className="sticky left-0 bg-white px-3 py-2 font-medium">{room.name}</td>
                {room.days.map((day) => (
                  <td key={day.date} className="px-1 py-1 text-center">
                    <button
                      type="button"
                      aria-label={`${room.name}, ${day.date}, currently ${day.status.toLowerCase()}`}
                      onClick={() => handleCellClick(room.id, day.date, day.status)}
                      className={`w-16 rounded px-1 py-1 ${STATUS_STYLES[day.status]}`}
                    >
                      {day.status.slice(0, 4)}
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
