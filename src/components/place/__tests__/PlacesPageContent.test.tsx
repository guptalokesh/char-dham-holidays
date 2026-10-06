import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PlacesPageContent } from "@/components/place/PlacesPageContent";

const places = [
  {
    id: "1",
    slug: "devrana-mandir",
    title: "Devrana Mandir & Mela",
    summary: "The temple and its mela.",
    body: "Pilgrims gather here.",
    address: "Devrana, Tiyan area, Uttarakhand",
    mapLink: "https://maps.example/devrana",
    images: [{ url: "/seed-images/a.jpg" }, { url: "/seed-images/b.jpg" }, { url: "/seed-images/c.jpg" }],
  },
  {
    id: "2",
    slug: "dhari-kalogi-basecamp",
    title: "Dhari–Kalogi Base Camp",
    summary: "Our local base camp.",
    body: "Treks start here.",
    address: null,
    mapLink: null,
    images: [],
  },
];

describe("PlacesPageContent", () => {
  it("renders one section per place with its title, summary and body", () => {
    render(<PlacesPageContent places={places} />);

    const mandir = screen.getByRole("region", { name: "Devrana Mandir & Mela" });
    expect(within(mandir).getByText("The temple and its mela.")).toBeInTheDocument();
    expect(within(mandir).getByText("Pilgrims gather here.")).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Dhari–Kalogi Base Camp" })).toBeInTheDocument();
  });

  it("shows the address and a map link only when set", () => {
    render(<PlacesPageContent places={places} />);

    const mandir = screen.getByRole("region", { name: "Devrana Mandir & Mela" });
    expect(within(mandir).getByText(/Tiyan area, Uttarakhand/)).toBeInTheDocument();
    expect(within(mandir).getByRole("link", { name: /view on map/i })).toHaveAttribute(
      "href",
      "https://maps.example/devrana"
    );

    const camp = screen.getByRole("region", { name: "Dhari–Kalogi Base Camp" });
    expect(within(camp).queryByRole("link", { name: /view on map/i })).not.toBeInTheDocument();
  });

  it("gives every photo a distinct alt text", () => {
    render(<PlacesPageContent places={places} />);

    const mandir = screen.getByRole("region", { name: "Devrana Mandir & Mela" });
    const alts = within(mandir)
      .getAllByRole("img")
      .map((img) => img.getAttribute("alt"));
    expect(new Set(alts).size).toBe(alts.length);
    expect(alts).toContain("Devrana Mandir & Mela — photo 3");
  });

  it("is a section of the Trekking page, headed by an h2 and anchored for the Devrana link", () => {
    const { container } = render(<PlacesPageContent places={places} />);

    expect(screen.getByRole("heading", { level: 2, name: "Devrana Mandir & Base Camp" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 1 })).not.toBeInTheDocument();
    expect(container.querySelector("section#devrana-mandir")).not.toBeNull();
  });

  it("shows a friendly message when there are no places", () => {
    render(<PlacesPageContent places={[]} />);

    expect(screen.getByText(/coming soon/i)).toBeInTheDocument();
  });
});
