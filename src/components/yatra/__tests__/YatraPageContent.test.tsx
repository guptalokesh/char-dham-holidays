import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { YatraPageContent, type YatraView } from "@/components/yatra/YatraPageContent";

const charDham: YatraView = {
  slug: "char-dham",
  name: "Char Dham Yatra by Helicopter",
  tagline: "Yamunotri, Gangotri, Kedarnath and Badrinath by helicopter",
  price: 21000,
  dhamChoice: false,
  active: true,
  routeOverview: "A guided helicopter pilgrimage to all four dhams.",
  startPoint: "Sahastradhara Helipad, Dehradun",
  howItStarts: "Your yatra begins in Dehradun.",
  steps: [
    { title: "Arrive in Dehradun", description: "Briefing and rest.", featured: false },
    { title: "Kedarnath", description: "Shuttle flight and darshan.", featured: true, imageUrl: "/seed-images/k.jpg" },
    { title: "Return to Dehradun", description: "Fly back.", featured: false },
  ],
  inclusions: ["Helicopter flights", "Hotel stays"],
  importantInfo: "Weather can delay flights.\nKeep spare days.",
  stayInfo: "Included",
  foodInfo: "Included",
  travelInfo: "Included",
  images: [{ url: "/seed-images/chardham.jpg" }],
  itineraryMedia: null,
};

const anyDham: YatraView = {
  ...charDham,
  slug: "any-dham",
  name: "Any Dham Yatra by Helicopter",
  price: null,
  dhamChoice: true,
  stayInfo: "",
  foodInfo: "",
  travelInfo: "",
  images: [],
};

const dhamOptions = [
  { title: "Kedarnath", description: "Shuttle flight and darshan.", featured: true },
  { title: "Badrinath", description: "A short drive from the helipad.", featured: true },
];

describe("YatraPageContent", () => {
  it("shows the name, tagline and a rupee price per person", () => {
    render(<YatraPageContent pkg={charDham} dhamOptions={[]} />);

    expect(screen.getByRole("heading", { level: 1, name: "Char Dham Yatra by Helicopter" })).toBeInTheDocument();
    expect(screen.getByText(/by helicopter$/i, { selector: "p" })).toBeInTheDocument();
    expect(screen.getByText(/₹21,000/)).toBeInTheDocument();
    expect(screen.getByText(/per person/i)).toBeInTheDocument();
  });

  it("shows price on request when there is no price", () => {
    render(<YatraPageContent pkg={anyDham} dhamOptions={dhamOptions} />);

    expect(screen.getByText("Price on request")).toBeInTheDocument();
    expect(screen.queryByText(/per person/i)).not.toBeInTheDocument();
  });

  it("explains where and how the yatra starts", () => {
    render(<YatraPageContent pkg={charDham} dhamOptions={[]} />);

    const section = screen.getByRole("region", { name: /where and how it starts/i });
    expect(within(section).getByText("Sahastradhara Helipad, Dehradun")).toBeInTheDocument();
    expect(within(section).getByText("Your yatra begins in Dehradun.")).toBeInTheDocument();
  });

  it("lists the journey as numbered steps in order, with dhams marked", () => {
    render(<YatraPageContent pkg={charDham} dhamOptions={[]} />);

    const journey = screen.getByRole("region", { name: /your journey, in order/i });
    const items = within(journey).getAllByRole("listitem");
    expect(items.map((li) => within(li).getByRole("heading", { level: 3 }).textContent)).toEqual([
      "Arrive in Dehradun",
      "Kedarnath",
      "Return to Dehradun",
    ]);
    expect(within(items[1]).getByText("Dham")).toBeInTheDocument();
    expect(within(items[0]).queryByText("Dham")).not.toBeInTheDocument();
  });

  it("lists inclusions, good-to-know points (one per line) and the Stay, Food and Travel facts", () => {
    render(<YatraPageContent pkg={charDham} dhamOptions={[]} />);

    const included = screen.getByRole("region", { name: /what.s usually included/i });
    expect(within(included).getByText("Helicopter flights")).toBeInTheDocument();
    expect(within(included).getByText("Hotel stays")).toBeInTheDocument();

    const good = screen.getByRole("region", { name: /good to know/i });
    expect(within(good).getAllByRole("listitem").map((li) => li.textContent)).toEqual([
      "Weather can delay flights.",
      "Keep spare days.",
    ]);
  });

  it("leaves out empty Stay, Food and Travel facts", () => {
    render(<YatraPageContent pkg={anyDham} dhamOptions={dhamOptions} />);

    expect(screen.queryByText("Stay")).not.toBeInTheDocument();
  });

  it("only offers dham checkboxes and the dham list when the dhams are chosen", () => {
    const { rerender } = render(<YatraPageContent pkg={charDham} dhamOptions={dhamOptions} />);
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    expect(screen.queryByRole("region", { name: /which dham/i })).not.toBeInTheDocument();

    rerender(<YatraPageContent pkg={anyDham} dhamOptions={dhamOptions} />);
    expect(screen.getAllByRole("checkbox")).toHaveLength(4);
    const dhams = screen.getByRole("region", { name: /which dham/i });
    expect(within(dhams).getByText("A short drive from the helipad.")).toBeInTheDocument();
  });

  it("shows the request form when active and an unavailable note when not", () => {
    const { rerender } = render(<YatraPageContent pkg={charDham} dhamOptions={[]} />);
    expect(screen.getByRole("button", { name: /check availability/i })).toBeInTheDocument();

    rerender(<YatraPageContent pkg={{ ...charDham, active: false }} dhamOptions={[]} />);
    expect(screen.queryByRole("button", { name: /check availability/i })).not.toBeInTheDocument();
    expect(screen.getByText(/not taking requests/i)).toBeInTheDocument();
  });

  it("links the itinerary PDF only when one is uploaded", () => {
    const { rerender } = render(<YatraPageContent pkg={charDham} dhamOptions={[]} />);
    expect(screen.queryByRole("link", { name: /itinerary/i })).not.toBeInTheDocument();

    rerender(
      <YatraPageContent pkg={{ ...charDham, itineraryMedia: { url: "/uploads/i.pdf" } }} dhamOptions={[]} />
    );
    expect(screen.getByRole("link", { name: /itinerary/i })).toHaveAttribute("href", "/uploads/i.pdf");
  });
});
