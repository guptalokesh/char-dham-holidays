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
import { ChardhamPageContent } from "@/components/chardham/ChardhamPageContent";
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
      <MobileNav links={[{ href: "/chardham", label: "Chardham" }]} />
    );
    getByRole("button", { name: /menu/i }).click();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("HomePageContent has no violations", async () => {
    const { container } = render(
      <HomePageContent
        heroHeading="Explore Uttarakhand"
        heroDescription="Spiritual journeys, mountain treks and peaceful stays."
        chardhamCtaLabel="Explore Chardham"
        trekkingCtaLabel="Explore Treks"
        chardhamPrice={210000}
        whatsappNumber="+91 98765 43210"
        whatsappCtaText="Chat on WhatsApp"
        contactCtaText="Send an Enquiry"
      />
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("ChardhamPageContent (active) has no violations", async () => {
    const { container } = render(
      <ChardhamPageContent
        pkg={{
          name: "Chardham Yatra by Helicopter",
          price: 210000,
          destinations: ["Yamunotri", "Gangotri", "Sri Kedarnath", "Badrinath"],
          stayInfo: "Included",
          foodInfo: "Included",
          travelInfo: "Included",
          travelPeriod: "May to June",
          routeOverview: "Fly between all four dhams.",
          importantInfo: "Subject to weather.",
          active: true,
          images: [{ url: "/seed-images/chardham.jpg" }],
          itineraryMedia: null,
        }}
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
          { service: "CHARDHAM", label: "Chardham Yatra by Helicopter" },
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
