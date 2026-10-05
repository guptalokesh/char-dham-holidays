import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ChardhamPageContent } from "@/components/chardham/ChardhamPageContent";

const basePkg = {
  name: "Chardham Yatra by Helicopter",
  price: 210000,
  destinations: ["Yamunotri", "Gangotri", "Sri Kedarnath", "Badrinath"],
  stayInfo: "Included",
  foodInfo: "Included",
  travelInfo: "Included",
  travelPeriod: "May to June",
  routeOverview: "Fly between all four dhams over a few days.",
  importantInfo: "Subject to weather conditions.",
  active: true,
  images: [{ url: "/seed-images/chardham.jpg" }],
  itineraryMedia: null as { url: string } | null,
};

describe("ChardhamPageContent", () => {
  it("shows the price, destinations and the availability form when active", () => {
    render(<ChardhamPageContent pkg={basePkg} />);

    expect(screen.getByText(/₹2,10,000/)).toBeInTheDocument();
    expect(screen.getByText("Yamunotri")).toBeInTheDocument();
    expect(screen.getByText("Badrinath")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /check availability/i })).toBeInTheDocument();
  });

  it("shows an unavailable message instead of the form when inactive", () => {
    render(<ChardhamPageContent pkg={{ ...basePkg, active: false }} />);

    expect(
      screen.getByText(/currently unavailable/i)
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /check availability/i })
    ).not.toBeInTheDocument();
  });

  it("shows an itinerary link only when one is set", () => {
    const { rerender } = render(<ChardhamPageContent pkg={basePkg} />);
    expect(screen.queryByText(/itinerary/i)).not.toBeInTheDocument();

    rerender(
      <ChardhamPageContent
        pkg={{ ...basePkg, itineraryMedia: { url: "/uploads/itinerary.pdf" } }}
      />
    );
    const link = screen.getByRole("link", { name: /itinerary/i });
    expect(link).toHaveAttribute("href", "/uploads/itinerary.pdf");
  });

  it("omits the travel period/route/important info sections when not set", () => {
    render(
      <ChardhamPageContent
        pkg={{
          ...basePkg,
          travelPeriod: null,
          routeOverview: null,
          importantInfo: null,
        }}
      />
    );

    expect(screen.queryByText(/may to june/i)).not.toBeInTheDocument();
  });

  it("shows the Yamunotri and Gangotri helicopter handling section when set", () => {
    render(
      <ChardhamPageContent
        pkg={{ ...basePkg, aircraftHandlingInfo: "Landing at Kharsali for Yamunotri and Harsil for Gangotri." }}
      />
    );

    expect(
      screen.getByRole("heading", { name: /yamunotri & gangotri helicopter handling/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/landing at kharsali/i)).toBeInTheDocument();
  });

  it("omits the helicopter handling section when no text is set", () => {
    render(<ChardhamPageContent pkg={{ ...basePkg, aircraftHandlingInfo: null }} />);

    expect(screen.queryByText(/helicopter handling/i)).not.toBeInTheDocument();
  });

  it("shows price on request when the package has no price", () => {
    render(<ChardhamPageContent pkg={{ ...basePkg, price: null }} />);

    expect(screen.getByText("Price on request")).toBeInTheDocument();
    expect(screen.queryByText(/per person|\/ person/)).not.toBeInTheDocument();
  });
});
