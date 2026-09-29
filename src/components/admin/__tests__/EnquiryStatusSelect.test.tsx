import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { EnquiryStatusSelect } from "@/components/admin/EnquiryStatusSelect";

describe("EnquiryStatusSelect", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("patches the new status when changed", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();

    render(<EnquiryStatusSelect enquiryId="enq-1" status="NEW" />);
    await user.selectOptions(screen.getByRole("combobox"), "CONTACTED");

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/admin/enquiries/enq-1",
        expect.objectContaining({ method: "PATCH" })
      )
    );
    const [, options] = fetchMock.mock.calls[0];
    expect(JSON.parse(options.body)).toEqual({ status: "CONTACTED" });
  });

  it("reverts to the previous status and shows an error on failure", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: false, json: async () => ({ error: "Not found." }) });
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();

    render(<EnquiryStatusSelect enquiryId="enq-1" status="NEW" />);
    await user.selectOptions(screen.getByRole("combobox"), "CLOSED");

    expect(await screen.findByRole("alert")).toHaveTextContent(/not found/i);
    expect(screen.getByRole("combobox")).toHaveValue("NEW");
  });
});
