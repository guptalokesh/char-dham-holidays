import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GeneralEnquiryForm } from "@/components/enquiry/GeneralEnquiryForm";

const serviceOptions = [
  { service: "CHARDHAM" as const, chardhamPackageId: "pkg-1", label: "Char Dham Yatra by Helicopter" },
  { service: "CHARDHAM" as const, chardhamPackageId: "pkg-2", label: "Any Dham Yatra by Helicopter" },
  { service: "TREKKING" as const, trekId: "trek-1", label: "Devrana Trek" },
  { service: "FARM_HOME_STAY" as const, label: "Farm Home Stay" },
  { service: "GENERAL" as const, label: "General Enquiry" },
];

async function fillCommonFields(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/name/i), "Meera Nair");
  await user.type(screen.getByLabelText(/phone/i), "+91 98765 43210");
  await user.type(screen.getByLabelText(/email/i), "meera@example.com");
  await user.type(screen.getByLabelText(/message/i), "I'd like to know more.");
}

describe("GeneralEnquiryForm", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("submits the selected trek's service and trekId", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ enquiryId: "enq-1" }),
    });
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();

    render(<GeneralEnquiryForm serviceOptions={serviceOptions} />);
    await fillCommonFields(user);
    await user.selectOptions(screen.getByLabelText(/service/i), "Devrana Trek");
    await user.click(screen.getByRole("button", { name: /send/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const [, options] = fetchMock.mock.calls[0];
    const body = JSON.parse(options.body);
    expect(body).toMatchObject({ service: "TREKKING", trekId: "trek-1" });
  });

  it("sends the WhatsApp number when one is entered", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ enquiryId: "enq-1" }) });
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();

    render(<GeneralEnquiryForm serviceOptions={serviceOptions} />);
    await fillCommonFields(user);
    await user.type(screen.getByLabelText(/whatsapp number/i), "+91 90000 11111");
    await user.click(screen.getByRole("button", { name: /send/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.whatsapp).toBe("+91 90000 11111");
  });

  it("shows a success message and does not claim the booking is confirmed", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ enquiryId: "enq-1" }),
    });
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();

    render(<GeneralEnquiryForm serviceOptions={serviceOptions} />);
    await fillCommonFields(user);
    await user.click(screen.getByRole("button", { name: /send/i }));

    const confirmation = await screen.findByText(/received your enquiry/i);
    expect(confirmation.textContent?.toLowerCase()).not.toContain("confirmed");
  });

  it("shows a validation error for an empty message without calling the API", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();

    render(<GeneralEnquiryForm serviceOptions={serviceOptions} />);
    await user.type(screen.getByLabelText(/name/i), "Meera Nair");
    await user.type(screen.getByLabelText(/phone/i), "+91 98765 43210");
    await user.type(screen.getByLabelText(/email/i), "meera@example.com");
    await user.click(screen.getByRole("button", { name: /send/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/message/i);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("shows the server error message on failure", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Too many requests. Please try again later." }),
    });
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();

    render(<GeneralEnquiryForm serviceOptions={serviceOptions} />);
    await fillCommonFields(user);
    await user.click(screen.getByRole("button", { name: /send/i }));

    expect(await screen.findByText(/too many requests/i)).toBeInTheDocument();
  });

  it("submits the selected yatra's chardhamPackageId", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ enquiryId: "enq-2" }) });
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();

    render(<GeneralEnquiryForm serviceOptions={serviceOptions} />);
    await fillCommonFields(user);
    await user.selectOptions(screen.getByLabelText(/service/i), "Any Dham Yatra by Helicopter");
    await user.click(screen.getByRole("button", { name: /send/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body).toMatchObject({ service: "CHARDHAM", chardhamPackageId: "pkg-2" });
  });
});
