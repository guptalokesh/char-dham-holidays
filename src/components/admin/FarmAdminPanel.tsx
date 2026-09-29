"use client";

import { useState } from "react";
import { ActiveToggle } from "@/components/admin/ActiveToggle";
import { MediaUploader } from "@/components/admin/MediaUploader";

interface RoomData {
  id: string;
  name: string;
  price: number;
  capacity: number;
  active: boolean;
  images: { id: string; url: string }[];
}

interface FarmPropertyData {
  id: string;
  description: string;
  location: string | null;
  mapLink: string | null;
  active: boolean;
  images: { id: string; url: string }[];
  rooms: RoomData[];
}

function RoomRow({ room, onUpdated }: { room: RoomData; onUpdated: (room: RoomData) => void }) {
  const [name, setName] = useState(room.name);
  const [price, setPrice] = useState(String(room.price));
  const [capacity, setCapacity] = useState(String(room.capacity));
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch(`/api/admin/farm/rooms/${room.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, price: Number(price), capacity: Number(capacity) }),
      });
      const json = await response.json();
      if (!response.ok) {
        setError(json.error ?? "Failed to save.");
        return;
      }
      onUpdated(json.room);
      setMessage("Room updated successfully.");
    } catch {
      setError("Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-lg border border-green-100 bg-white p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4 sm:items-end">
        <div className="space-y-1">
          <label className="block text-xs font-medium text-zinc-500">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded border border-zinc-300 px-2 py-1"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-medium text-zinc-500">Price (₹/night)</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full rounded border border-zinc-300 px-2 py-1"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-medium text-zinc-500">Capacity</label>
          <input
            type="number"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            className="w-full rounded border border-zinc-300 px-2 py-1"
          />
        </div>
        <div className="flex items-center gap-2">
          <ActiveToggle
            patchUrl={`/api/admin/farm/rooms/${room.id}`}
            active={room.active}
            onChanged={(active) => onUpdated({ ...room, active })}
          />
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded bg-zinc-900 px-3 py-1.5 text-sm text-white disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-2 text-xs text-red-600">
          {error}
        </p>
      )}
      {message && <p className="mt-2 text-xs text-green-700">{message}</p>}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {room.images.map((image) => (
          <img key={image.id} src={image.url} alt="" className="h-16 w-24 rounded object-cover" />
        ))}
        <MediaUploader
          purpose="IMAGE"
          owner={{ roomId: room.id }}
          label="Upload room photo"
          onUploaded={(media) => onUpdated({ ...room, images: [...room.images, media] })}
        />
      </div>
    </div>
  );
}

export function FarmAdminPanel({ initial }: { initial: FarmPropertyData }) {
  const [property, setProperty] = useState(initial);
  const [description, setDescription] = useState(initial.description);
  const [location, setLocation] = useState(initial.location ?? "");
  const [propertyMessage, setPropertyMessage] = useState<string | null>(null);
  const [propertyError, setPropertyError] = useState<string | null>(null);
  const [savingProperty, setSavingProperty] = useState(false);

  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomPrice, setNewRoomPrice] = useState("");
  const [newRoomCapacity, setNewRoomCapacity] = useState("2");
  const [createError, setCreateError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  async function handlePropertySubmit(event: React.FormEvent) {
    event.preventDefault();
    setPropertyError(null);
    setPropertyMessage(null);
    setSavingProperty(true);
    try {
      const response = await fetch("/api/admin/farm", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, location }),
      });
      const json = await response.json();
      if (!response.ok) {
        setPropertyError(json.error ?? "Something went wrong.");
        return;
      }
      setProperty(json.property);
      setPropertyMessage(json.message ?? "Listing updated successfully.");
    } catch {
      setPropertyError("Something went wrong.");
    } finally {
      setSavingProperty(false);
    }
  }

  async function handleCreateRoom(event: React.FormEvent) {
    event.preventDefault();
    setCreateError(null);

    if (!newRoomName.trim() || !newRoomPrice.trim()) {
      setCreateError("Name and price are required.");
      return;
    }

    setCreating(true);
    try {
      const response = await fetch("/api/admin/farm/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newRoomName,
          price: Number(newRoomPrice),
          capacity: Number(newRoomCapacity),
        }),
      });
      const json = await response.json();
      if (!response.ok) {
        setCreateError(json.error ?? "Something went wrong.");
        return;
      }
      setProperty({ ...property, rooms: [...property.rooms, { ...json.room, images: [] }] });
      setNewRoomName("");
      setNewRoomPrice("");
      setNewRoomCapacity("2");
    } catch {
      setCreateError("Something went wrong.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-8">
      <form
        onSubmit={handlePropertySubmit}
        className="space-y-4 rounded-lg border border-zinc-200 bg-white p-6"
      >
        <div className="space-y-1">
          <label htmlFor="farm-description" className="block text-sm font-medium">
            Description
          </label>
          <textarea
            id="farm-description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded border border-zinc-300 px-3 py-2"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="farm-location" className="block text-sm font-medium">
            Location (optional)
          </label>
          <input
            id="farm-location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full rounded border border-zinc-300 px-3 py-2"
          />
        </div>
        {propertyError && (
          <p role="alert" className="text-sm text-red-600">
            {propertyError}
          </p>
        )}
        {propertyMessage && <p className="text-sm text-green-700">{propertyMessage}</p>}
        <button
          type="submit"
          disabled={savingProperty}
          className="rounded bg-zinc-900 px-4 py-2 text-white disabled:opacity-50"
        >
          {savingProperty ? "Saving..." : "Save changes"}
        </button>
      </form>

      <div className="rounded-lg border border-zinc-200 bg-white p-6">
        <h2 className="font-semibold">Property images</h2>
        <div className="mt-3 flex flex-wrap gap-3">
          {property.images.map((image) => (
            <img key={image.id} src={image.url} alt="" className="h-24 w-32 rounded object-cover" />
          ))}
        </div>
        <div className="mt-4">
          <MediaUploader
            purpose="IMAGE"
            owner={{ farmPropertyId: property.id }}
            label="Upload image"
            onUploaded={(media) =>
              setProperty({ ...property, images: [...property.images, media] })
            }
          />
        </div>
      </div>

      <section>
        <h2 className="text-lg font-semibold">Rooms</h2>
        <div className="mt-3 space-y-3">
          {property.rooms.map((room) => (
            <RoomRow
              key={room.id}
              room={room}
              onUpdated={(updated) =>
                setProperty({
                  ...property,
                  rooms: property.rooms.map((r) => (r.id === updated.id ? updated : r)),
                })
              }
            />
          ))}
        </div>

        <form
          onSubmit={handleCreateRoom}
          className="mt-4 space-y-3 rounded-lg border border-zinc-200 bg-white p-6"
        >
          <h3 className="font-semibold">Add a new room</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <input
              placeholder="Name"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              className="rounded border border-zinc-300 px-3 py-2"
            />
            <input
              placeholder="Price (₹/night)"
              type="number"
              value={newRoomPrice}
              onChange={(e) => setNewRoomPrice(e.target.value)}
              className="rounded border border-zinc-300 px-3 py-2"
            />
            <input
              placeholder="Capacity"
              type="number"
              value={newRoomCapacity}
              onChange={(e) => setNewRoomCapacity(e.target.value)}
              className="rounded border border-zinc-300 px-3 py-2"
            />
          </div>
          {createError && (
            <p role="alert" className="text-sm text-red-600">
              {createError}
            </p>
          )}
          <button
            type="submit"
            disabled={creating}
            className="rounded bg-zinc-900 px-4 py-2 text-white disabled:opacity-50"
          >
            {creating ? "Adding..." : "Add room"}
          </button>
        </form>
      </section>
    </div>
  );
}
