import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SettingsAdminForm } from "@/components/admin/SettingsAdminForm";

const initial = {
  businessName: "Char Dham Holidays",
  shortDescription: null,
  addressLine: null,
  city: null,
  state: null,
  country: null,
  mapLink: null,
  primaryPhone: null,
  secondaryPhone: null,
  whatsappNumber: null,
  primaryEmail: null,
  enquiryEmail: null,
  instagramUrl: null,
  facebookUrl: null,
  youtubeUrl: null,
  otherSocialUrl: null,
  primaryColor: "#1B4B66",
  secondaryColor: "#E08A2C",
  trekkingAccentColor: "#2F6B3A",
  heroHeading: "Explore Uttarakhand",
  heroDescription: "Spiritual journeys, mountain treks and peaceful stays.",
  chardhamCtaLabel: "Explore Chardham",
  trekkingCtaLabel: "Explore Treks",
  whatsappCtaText: "Chat on WhatsApp",
  contactCtaText: "Send an Enquiry",
  footerCopyrightText: null,
};

describe("SettingsAdminForm", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("submits only the changed field via PATCH and shows the save confirmation", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        settings: { ...initial, whatsappNumber: "+91 98765 43210" },
        message: "Settings saved successfully.",
      }),
    });
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();

    render(<SettingsAdminForm initial={initial} />);
    await user.type(screen.getByLabelText(/whatsapp number/i), "+91 98765 43210");
    await user.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/admin/settings");
    expect(JSON.parse(options.body)).toMatchObject({ whatsappNumber: "+91 98765 43210" });
    expect(await screen.findByText(/settings saved successfully/i)).toBeInTheDocument();
  });

  it("shows a validation error from the server without crashing", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Invalid settings data." }),
    });
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();

    render(<SettingsAdminForm initial={initial} />);
    await user.type(screen.getByLabelText(/primary email/i), "not-an-email");
    await user.click(screen.getByRole("button", { name: /save/i }));

    expect(await screen.findByText(/invalid settings data/i)).toBeInTheDocument();
  });

  it("offers one phone and one email, with no secondary phone or separate enquiry email", () => {
    render(<SettingsAdminForm initial={initial} />);

    expect(screen.getByLabelText("Primary phone")).toBeInTheDocument();
    expect(screen.getByLabelText("Primary email")).toBeInTheDocument();
    expect(screen.queryByLabelText("Secondary phone")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Enquiry email")).not.toBeInTheDocument();
  });
});
