import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ChardhamAvailabilityForm } from "@/components/chardham/ChardhamAvailabilityForm";

function futureDateInput(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().slice(0, 10);
}

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/name/i), "Anita Rao");
  await user.type(screen.getByLabelText(/phone/i), "+91 98765 43210");
  await user.type(screen.getByLabelText(/preferred date/i), futureDateInput(10));
  await user.clear(screen.getByLabelText(/travellers/i));
  await user.type(screen.getByLabelText(/travellers/i), "2");
}

describe("ChardhamAvailabilityForm", () => {
  let openSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("shows a validation error for a past date without calling the API", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();

    render(<ChardhamAvailabilityForm />);
    await fillValidForm(user);
    await user.clear(screen.getByLabelText(/preferred date/i));
    await user.type(screen.getByLabelText(/preferred date/i), futureDateInput(-3));

    await user.click(screen.getByRole("button", { name: /check availability/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/past/i);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("submits valid input and opens the returned WhatsApp URL", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ whatsappUrl: "https://wa.me/919000000000?text=hi" }),
    });
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();

    render(<ChardhamAvailabilityForm />);
    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /check availability/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/chardham/availability",
      expect.objectContaining({ method: "POST" })
    );
    await waitFor(() =>
      expect(openSpy).toHaveBeenCalledWith(
        "https://wa.me/919000000000?text=hi",
        "_blank",
        "noopener,noreferrer"
      )
    );
  });

  it("shows a confirmation message (no WhatsApp popup) when whatsappUrl is null", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ whatsappUrl: null }),
    });
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();

    render(<ChardhamAvailabilityForm />);
    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /check availability/i }));

    expect(await screen.findByText(/we.?ve received your request/i)).toBeInTheDocument();
    expect(openSpy).not.toHaveBeenCalled();
  });

  it("shows the server error message on a failed submission", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Too many requests. Please try again later." }),
    });
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();

    render(<ChardhamAvailabilityForm />);
    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /check availability/i }));

    expect(
      await screen.findByText(/too many requests/i)
    ).toBeInTheDocument();
  });
});
