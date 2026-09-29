import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FarmPageContent } from "@/components/farm/FarmPageContent";

const baseProperty = {
  description: "Peaceful farm stay in the hills.",
  location: "Near Rishikesh",
  mapLink: null as string | null,
  active: true,
  images: [{ url: "/seed-images/homestay.jpg" }],
  rooms: [
    {
      id: "room-1",
      name: "Deluxe Room",
      price: 3500,
      capacity: 2,
      amenities: ["Wi-Fi", "Hot water"],
      active: true,
      images: [],
    },
  ],
};

describe("FarmPageContent", () => {
  it("shows the property description and each active room's details", () => {
    render(<FarmPageContent property={baseProperty} />);

    expect(screen.getByText(/peaceful farm stay/i)).toBeInTheDocument();
    expect(screen.getByText("Deluxe Room")).toBeInTheDocument();
    expect(screen.getByText(/₹3,500/)).toBeInTheDocument();
    expect(screen.getByText("Wi-Fi")).toBeInTheDocument();
  });

  it("hides inactive rooms from the static room list", () => {
    render(
      <FarmPageContent
        property={{
          ...baseProperty,
          rooms: [
            ...baseProperty.rooms,
            {
              id: "room-2",
              name: "Hidden Room",
              price: 1000,
              capacity: 1,
              amenities: [],
              active: false,
              images: [],
            },
          ],
        }}
      />
    );

    expect(screen.queryByText("Hidden Room")).not.toBeInTheDocument();
  });

  it("shows an unavailable message instead of the search form when the property is inactive", () => {
    render(<FarmPageContent property={{ ...baseProperty, active: false }} />);

    expect(screen.getByText(/currently unavailable/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/check-in/i)).not.toBeInTheDocument();
  });
});
