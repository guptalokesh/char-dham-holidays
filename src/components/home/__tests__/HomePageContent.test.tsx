import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HomePageContent } from "@/components/home/HomePageContent";

const baseProps = {
  heroHeading: "Visit the Char Dham by Helicopter",
  heroDescription: "Yamunotri, Gangotri, Kedarnath and Badrinath, made simple.",
  chardhamCtaLabel: "Explore Char Dham",
  trekkingCtaLabel: "Explore Treks",
  chardhamPrice: 21000 as number | null,
  whatsappNumber: "+91 98765 43210" as string | null,
  whatsappCtaText: "Chat on WhatsApp",
  contactCtaText: "Send an Enquiry",
  yatras: [
    { slug: "char-dham", name: "Char Dham Yatra by Helicopter", tagline: "All four dhams", price: 21000 as number | null, images: [{ url: "/seed-images/chardham.jpg" }] },
    { slug: "any-dham", name: "Any Dham Yatra by Helicopter", tagline: "Visit the dham you wish", price: null as number | null, images: [] },
    { slug: "yamunotri-gangotri-handling", name: "Yamunotri & Gangotri Helicopter Handling", tagline: "Ground support", price: null as number | null, images: [] },
  ],
  dhams: [
    { title: "Yamunotri", description: "Source of the Yamuna.", imageUrl: "/seed-images/y.jpg" },
    { title: "Gangotri", description: "Origin of the Ganga." },
    { title: "Kedarnath", description: "Abode of Lord Shiva." },
    { title: "Badrinath", description: "Seat of Lord Vishnu." },
  ],
  journey: ["Arrive in Dehradun", "Fly to the dhams", "Return to Dehradun"],
  inclusions: ["Helicopter flights", "Hotel stays"],
};

describe("HomePageContent", () => {
  it("leads with the Char Dham: heading, from-price and the Char Dham and all-yatras buttons", () => {
    render(<HomePageContent {...baseProps} />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Visit the Char Dham by Helicopter");
    expect(screen.getByText(/kedarnath and badrinath, made simple/i)).toBeInTheDocument();
    expect(screen.getByText(/from ₹21,000 per person/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Explore Char Dham" })).toHaveAttribute("href", "/yatra/char-dham");
    expect(screen.getByRole("link", { name: "See all yatras" })).toHaveAttribute("href", "/yatra");
  });

  it("keeps the season offer on the page permanently, with both prices and booking links", () => {
    render(<HomePageContent {...baseProps} />);

    const offer = screen.getByRole("region", { name: /helicopter yatra season is open/i });
    expect(offer).toHaveTextContent(/April – June & September – October/);
    expect(offer).toHaveTextContent("₹21,000");
    expect(offer).toHaveTextContent("Price on request");
    expect(within(offer).getByRole("link", { name: "Book now" })).toHaveAttribute("href", "/yatra/char-dham");
    expect(within(offer).getByRole("link", { name: "View packages" })).toHaveAttribute("href", "/yatra");
  });

  it("omits the from-price when Char Dham has no price", () => {
    render(<HomePageContent {...baseProps} chardhamPrice={null} />);

    expect(screen.queryByText(/from ₹/i)).not.toBeInTheDocument();
  });

  it("shows the four dhams in order", () => {
    render(<HomePageContent {...baseProps} />);

    const section = screen.getByRole("region", { name: /the four dhams/i });
    const titles = within(section).getAllByRole("heading", { level: 3 }).map((h) => h.textContent);
    expect(titles).toEqual(["Yamunotri", "Gangotri", "Kedarnath", "Badrinath"]);
    expect(within(section).getByText("Origin of the Ganga.")).toBeInTheDocument();
  });

  it("lists every helicopter yatra with its page link and price or price on request", () => {
    render(<HomePageContent {...baseProps} />);

    const section = screen.getByRole("region", { name: /our helicopter yatras/i });
    expect(within(section).getByRole("link", { name: /char dham yatra by helicopter/i })).toHaveAttribute("href", "/yatra/char-dham");
    expect(within(section).getByRole("link", { name: /any dham yatra by helicopter/i })).toHaveAttribute("href", "/yatra/any-dham");
    expect(within(section).getByRole("link", { name: /yamunotri & gangotri helicopter handling/i })).toHaveAttribute(
      "href",
      "/yatra/yamunotri-gangotri-handling"
    );
    expect(within(section).getByText(/₹21,000/)).toBeInTheDocument();
    expect(within(section).getAllByText("Price on request")).toHaveLength(2);
  });

  it("explains how a yatra works, in order, with what is included", () => {
    render(<HomePageContent {...baseProps} />);

    const section = screen.getByRole("region", { name: /how your yatra works/i });
    expect(within(section).getAllByRole("listitem").slice(0, 3).map((li) => li.textContent)).toEqual([
      expect.stringContaining("Arrive in Dehradun"),
      expect.stringContaining("Fly to the dhams"),
      expect.stringContaining("Return to Dehradun"),
    ]);
    expect(within(section).getByText("Hotel stays")).toBeInTheDocument();
  });

  it("still offers trekking, the farm home stay and enquiries as other experiences", () => {
    render(<HomePageContent {...baseProps} />);

    const section = screen.getByRole("region", { name: /other experiences/i });
    expect(within(section).getByRole("link", { name: /trekking/i })).toHaveAttribute("href", "/trekking");
    expect(within(section).getByRole("link", { name: /farm home stay/i })).toHaveAttribute("href", "/farm-home-stay");
    expect(within(section).getByRole("link", { name: "Explore Treks" })).toHaveAttribute("href", "/trekking");
  });

  it("does not hard-code how many journeys there are", () => {
    render(<HomePageContent {...baseProps} />);

    expect(document.body.textContent).not.toMatch(/three (journeys|ways)/i);
  });

  it("shows the WhatsApp CTA when a number is configured and hides it otherwise", () => {
    const { rerender } = render(<HomePageContent {...baseProps} />);
    expect(screen.getByRole("link", { name: /chat on whatsapp/i })).toBeInTheDocument();

    rerender(<HomePageContent {...baseProps} whatsappNumber={null} />);
    expect(screen.queryByRole("link", { name: /chat on whatsapp/i })).not.toBeInTheDocument();
  });

  it("shows a Send an Enquiry link to the contact page", () => {
    render(<HomePageContent {...baseProps} />);
    expect(screen.getByRole("link", { name: /send an enquiry/i })).toHaveAttribute("href", "/contact");
  });

  it("does not fabricate testimonials, awards or customer counts", () => {
    render(<HomePageContent {...baseProps} />);
    const text = document.body.textContent?.toLowerCase() ?? "";
    expect(text).not.toMatch(/testimonial|award|certified|5-star|customers served|yatris served/);
  });

  it("teases the Devrana mandir page with its photo when a place is provided", () => {
    render(
      <HomePageContent
        {...baseProps}
        devrana={{ title: "Devrana Mandir & Mela", summary: "The temple and its mela.", imageUrl: "/seed-images/devrana-mela-hero.jpg" }}
      />
    );

    const link = screen.getByRole("link", { name: /devrana mandir & mela/i });
    expect(link).toHaveAttribute("href", "/trekking#devrana-mandir");
    expect(screen.getByText("The temple and its mela.")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Devrana Mandir & Mela" })).toBeInTheDocument();
  });

  it("omits the Devrana teaser when no place is provided", () => {
    render(<HomePageContent {...baseProps} />);

    expect(screen.queryByRole("link", { name: /devrana/i })).not.toBeInTheDocument();
  });

  it("credits the openly licensed dham photos", () => {
    render(
      <HomePageContent
        {...baseProps}
        dhams={[{ title: "Badrinath", description: "Seat of Lord Vishnu.", imageUrl: "/seed-images/dham-badrinath.jpg" }]}
      />
    );

    expect(screen.getByText(/photo credits/i)).toBeInTheDocument();
    expect(screen.getByText(/Vishwanath Negi/)).toBeInTheDocument();
  });
});
