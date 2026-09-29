import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TrekPageContent } from "@/components/trek/TrekPageContent";

const baseTrek = {
  slug: "devrana-trek",
  name: "Devrana Trek",
  description: "A customised trekking experience through Devrana.",
  price: null as number | null,
  active: true,
  images: [{ url: "/seed-images/trek-devrana.jpg" }],
  itineraryMedia: null as { url: string } | null,
};

describe("TrekPageContent", () => {
  it("shows the request form when active", () => {
    render(<TrekPageContent trek={baseTrek} />);

    expect(screen.getByText("Devrana Trek")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /request/i })).toBeInTheDocument();
  });

  it("shows an unavailable message instead of the form when inactive", () => {
    render(<TrekPageContent trek={{ ...baseTrek, active: false }} />);

    expect(screen.getByText(/currently unavailable/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /request/i })).not.toBeInTheDocument();
  });

  it("shows an itinerary link only when one is set", () => {
    const { rerender } = render(<TrekPageContent trek={baseTrek} />);
    expect(screen.queryByText(/itinerary/i)).not.toBeInTheDocument();

    rerender(
      <TrekPageContent
        trek={{ ...baseTrek, itineraryMedia: { url: "/uploads/itinerary.pdf" } }}
      />
    );
    expect(screen.getByRole("link", { name: /itinerary/i })).toHaveAttribute(
      "href",
      "/uploads/itinerary.pdf"
    );
  });
});
