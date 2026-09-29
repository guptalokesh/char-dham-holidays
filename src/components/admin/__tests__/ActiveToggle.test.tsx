import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ActiveToggle } from "@/components/admin/ActiveToggle";

describe("ActiveToggle", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("shows the current state and toggles it via PATCH on click", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();

    render(<ActiveToggle patchUrl="/api/admin/treks/trek-1" active={true} />);
    const toggle = screen.getByRole("switch");
    expect(toggle).toHaveAttribute("aria-checked", "true");

    await user.click(toggle);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/admin/treks/trek-1");
    expect(JSON.parse(options.body)).toEqual({ active: false });
    expect(toggle).toHaveAttribute("aria-checked", "false");
  });

  it("reverts and shows an error when the request fails", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: false, json: async () => ({ error: "Server error." }) });
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();

    render(<ActiveToggle patchUrl="/api/admin/treks/trek-1" active={true} />);
    await user.click(screen.getByRole("switch"));

    expect(await screen.findByRole("alert")).toHaveTextContent(/server error/i);
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true");
  });
});
