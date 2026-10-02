import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/db";
import { getPlaceById, getPlaceBySlug, listPlaces, updatePlace } from "@/lib/place";

async function makePlace(slug: string, order: number, active = true) {
  return prisma.place.create({
    data: { slug, title: slug.toUpperCase(), summary: "s", body: "b", order, active },
  });
}

describe("place module", () => {
  beforeEach(async () => {
    await prisma.media.deleteMany();
    await prisma.place.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("lists active places in display order by default", async () => {
    await makePlace("second", 2);
    await makePlace("first", 1);
    await makePlace("hidden", 0, false);

    expect((await listPlaces()).map((p) => p.slug)).toEqual(["first", "second"]);
    expect((await listPlaces({ activeOnly: false })).map((p) => p.slug)).toEqual([
      "hidden",
      "first",
      "second",
    ]);
  });

  it("returns a place with its images oldest-first, by slug and by id", async () => {
    const place = await makePlace("devrana", 1);
    const base = Date.now();
    for (const [name, offset] of [["b", 1], ["a", 0]] as const) {
      await prisma.media.create({
        data: {
          url: `/uploads/${name}.jpg`,
          filename: `${name}.jpg`,
          mimeType: "image/jpeg",
          size: 1,
          purpose: "IMAGE",
          placeId: place.id,
          createdAt: new Date(base + offset * 1000),
        },
      });
    }

    const urls = ["/uploads/a.jpg", "/uploads/b.jpg"];
    expect((await getPlaceBySlug("devrana"))?.images.map((i) => i.url)).toEqual(urls);
    expect((await getPlaceById(place.id))?.images.map((i) => i.url)).toEqual(urls);
  });

  it("returns null for an unknown slug", async () => {
    expect(await getPlaceBySlug("nope")).toBeNull();
  });

  it("updates editable fields and trims text", async () => {
    const place = await makePlace("devrana", 1);

    const updated = await updatePlace(place.id, {
      title: "  Devrana Mandir  ",
      summary: "New summary",
      body: "New body",
      address: "Tiyan, Uttarakhand 249171",
      mapLink: "",
      active: false,
    });

    expect(updated.title).toBe("Devrana Mandir");
    expect(updated.address).toBe("Tiyan, Uttarakhand 249171");
    expect(updated.mapLink).toBeNull();
    expect(updated.active).toBe(false);
  });

  it("rejects an empty title and ignores unknown keys", async () => {
    const place = await makePlace("devrana", 1);

    await expect(updatePlace(place.id, { title: "  " })).rejects.toThrow();

    await updatePlace(place.id, { slug: "hacked", title: "Ok" } as never);
    expect((await getPlaceById(place.id))?.slug).toBe("devrana");
  });
});
