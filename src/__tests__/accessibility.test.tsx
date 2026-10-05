import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";

// AdminNav renders LogoutButton, which calls useRouter() — stub it since
// these are plain component-render tests, not full Next.js app router tests.
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { HomePageContent } from "@/components/home/HomePageContent";
import { ChardhamAvailabilityForm } from "@/components/chardham/ChardhamAvailabilityForm";
import { TrekPageContent } from "@/components/trek/TrekPageContent";
import { TrekRequestForm } from "@/components/trek/TrekRequestForm";
import { TrekCard } from "@/components/trek/TrekCard";
import { FarmPageContent } from "@/components/farm/FarmPageContent";
import { GeneralEnquiryForm } from "@/components/enquiry/GeneralEnquiryForm";
import { AdminNav } from "@/components/admin/AdminNav";
import { EnquiriesTable } from "@/components/admin/EnquiriesTable";
import { RoomAvailabilityGrid } from "@/components/admin/RoomAvailabilityGrid";
import { ActiveToggle } from "@/components/admin/ActiveToggle";
import { MediaUploader } from "@/components/admin/MediaUploader";
import { FarmAvailabilitySearch } from "@/components/farm/FarmAvailabilitySearch";
import { FarmAdminPanel } from "@/components/admin/FarmAdminPanel";
import { PlacesPageContent } from "@/components/place/PlacesPageContent";
import { YatraPageContent } from "@/components/yatra/YatraPageContent";
import { YatraHubContent } from "@/components/yatra/YatraHubContent";

const headerFooterSettings = {
  businessName: "Char Dham Holidays",
  whatsappNumber: "+91 98765 43210",
  primaryPhone: "+91 98765 43210",
  primaryEmail: "hello@chardhamholidays.example",
  addressLine: "123 Mall Road",
  city: "Dehradun",
  instagramUrl: "https://instagram.com/chardhamholidays",
  facebookUrl: null,
  youtubeUrl: null,
  otherSocialUrl: null,
  footerCopyrightText: null,
  whatsappCtaText: "Chat on WhatsApp",
  contactCtaText: "Check Availability",
  logoMedia: null,
};

describe("accessibility (axe)", () => {
  it("Header has no violations", async () => {
    const { container } = render(<Header settings={headerFooterSettings} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("Footer has no violations", async () => {
    const { container } = render(<Footer settings={headerFooterSettings} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("MobileNav (expanded) has no violations", async () => {
    const { container, getByRole } = render(
      <MobileNav links={[{ href: "/yatra", label: "Helicopter Yatra" }]} />
    );
    getByRole("button", { name: /menu/i }).click();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("HomePageContent has no violations", async () => {
    const { container } = render(
      <HomePageContent
        heroHeading="Visit the Char Dham by Helicopter"
        heroDescription="Fly to the four dhams."
        chardhamCtaLabel="Explore Char Dham"
        trekkingCtaLabel="Explore Treks"
        chardhamPrice={21000}
        yatras={[{ slug: "char-dham", name: "Char Dham Yatra by Helicopter", tagline: "All four dhams", price: 21000, images: [] }]}
        dhams={[{ title: "Kedarnath", description: "Abode of Lord Shiva." }]}
        journey={["Arrive in Dehradun", "Return"]}
        inclusions={["Helicopter flights"]}
        whatsappNumber="+91 98765 43210"
        whatsappCtaText="Chat on WhatsApp"
        contactCtaText="Send an Enquiry"
      />
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("ChardhamAvailabilityForm has no violations", async () => {
    const { container } = render(<ChardhamAvailabilityForm />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("TrekPageContent (active) has no violations", async () => {
    const { container } = render(
      <TrekPageContent
        trek={{
          slug: "devrana-trek",
          name: "Devrana Trek",
          description: "A customised trekking experience.",
          price: null,
          active: true,
          images: [{ url: "/seed-images/trek-devrana.jpg" }],
          itineraryMedia: null,
        }}
      />
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("PlacesPageContent has no violations", async () => {
    const { container } = render(
      <PlacesPageContent
        places={[
          {
            id: "1",
            slug: "devrana-mandir",
            title: "Devrana Mandir & Mela",
            summary: "The temple and its mela.",
            body: "Pilgrims gather here.",
            address: "Devrana, Tiyan area, Uttarakhand",
            mapLink: "https://maps.example/devrana",
            images: [{ url: "/seed-images/a.jpg" }, { url: "/seed-images/b.jpg" }],
          },
        ]}
      />
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("YatraPageContent (Any Dham, with dham choice) has no violations", async () => {
    const { container } = render(
      <YatraPageContent
        pkg={{
          slug: "any-dham",
          name: "Any Dham Yatra by Helicopter",
          tagline: "Visit the dham you wish",
          price: null,
          dhamChoice: true,
          active: true,
          routeOverview: "Overview.",
          startPoint: "Dehradun",
          howItStarts: "We meet you.",
          steps: [{ title: "Arrive", description: "Briefing.", featured: false }],
          inclusions: ["Helicopter flights"],
          importantInfo: "Weather note.",
          stayInfo: "",
          foodInfo: "",
          travelInfo: "",
          images: [],
          itineraryMedia: null,
        }}
        dhamOptions={[{ title: "Kedarnath", description: "Darshan.", featured: true }]}
      />
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("YatraHubContent has no violations", async () => {
    const { container } = render(
      <YatraHubContent
        yatras={[{ slug: "char-dham", name: "Char Dham Yatra by Helicopter", tagline: "All four dhams", price: 21000, images: [] }]}
      />
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("TrekRequestForm has no violations", async () => {
    const { container } = render(<TrekRequestForm trekSlug="devrana-trek" />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("TrekCard has no violations", async () => {
    const { container } = render(
      <TrekCard
        trek={{
          slug: "devrana-trek",
          name: "Devrana Trek",
          description: "A customised trekking experience.",
          price: null,
          images: [{ url: "/seed-images/trek-devrana.jpg" }],
        }}
      />
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("FarmPageContent has no violations", async () => {
    const { container } = render(
      <FarmPageContent
        property={{
          description: "Peaceful farm stay in the hills.",
          location: "Near Rishikesh",
          mapLink: null,
          active: true,
          images: [{ url: "/seed-images/homestay.jpg" }],
          rooms: [
            {
              id: "room-1",
              name: "Deluxe Room",
              price: 3500,
              capacity: 2,
              amenities: ["Wi-Fi"],
              active: true,
              images: [],
            },
          ],
        }}
      />
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("GeneralEnquiryForm has no violations", async () => {
    const { container } = render(
      <GeneralEnquiryForm
        serviceOptions={[
          { service: "CHARDHAM", label: "Char Dham Yatra by Helicopter" },
          { service: "GENERAL", label: "General Enquiry" },
        ]}
      />
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("AdminNav has no violations", async () => {
    const { container } = render(<AdminNav />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("EnquiriesTable has no violations", async () => {
    const { container } = render(
      <EnquiriesTable
        enquiries={[
          {
            id: "enq-1",
            name: "Meera Nair",
            phone: "+91 98765 43210",
            email: "meera@example.com",
            service: "GENERAL",
            message: "Hello",
            status: "NEW",
            createdAt: new Date().toISOString(),
            trek: null,
            room: null,
          },
        ]}
      />
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("ActiveToggle (custom switch widget) has no violations", async () => {
    const { container } = render(
      <ActiveToggle patchUrl="/api/admin/treks/trek-1" active={true} />
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("MediaUploader has no violations", async () => {
    const { container } = render(
      <MediaUploader purpose="IMAGE" label="Upload photo" owner={{ trekId: "trek-1" }} />
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("FarmAvailabilitySearch has no violations", async () => {
    const { container } = render(<FarmAvailabilitySearch />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("FarmAdminPanel (including the inline room-edit row) has no violations", async () => {
    const { container } = render(
      <FarmAdminPanel
        initial={{
          id: "farm-1",
          description: "Peaceful farm stay.",
          location: "Near Rishikesh",
          mapLink: null,
          active: true,
          images: [],
          rooms: [
            {
              id: "room-1",
              name: "Deluxe Room",
              price: 3500,
              capacity: 2,
              active: true,
              images: [],
            },
          ],
        }}
      />
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("RoomAvailabilityGrid has no violations", async () => {
    const { container } = render(
      <RoomAvailabilityGrid
        initial={[
          {
            id: "room-1",
            name: "Deluxe Room",
            active: true,
            days: [{ date: "2026-10-20", status: "AVAILABLE" }],
          },
        ]}
      />
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
