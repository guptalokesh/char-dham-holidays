import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MediaUploader } from "@/components/admin/MediaUploader";

describe("MediaUploader", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("uploads the selected file with the purpose and owner reference", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ media: { id: "media-1", url: "/uploads/x.jpg" } }),
    });
    vi.stubGlobal("fetch", fetchMock);
    const onUploaded = vi.fn();
    const user = userEvent.setup();

    render(
      <MediaUploader
        purpose="IMAGE"
        owner={{ trekId: "trek-1" }}
        label="Upload photo"
        onUploaded={onUploaded}
      />
    );

    const file = new File(["fake"], "photo.jpg", { type: "image/jpeg" });
    await user.upload(screen.getByLabelText(/upload photo/i), file);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/admin/media");
    const body = options.body as FormData;
    expect(body.get("purpose")).toBe("IMAGE");
    expect(body.get("trekId")).toBe("trek-1");
    expect(body.get("file")).toBe(file);

    await waitFor(() =>
      expect(onUploaded).toHaveBeenCalledWith({ id: "media-1", url: "/uploads/x.jpg" })
    );
  });

  it("shows an error message when the upload fails", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Unrecognized or unsupported file type." }),
    });
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();

    render(<MediaUploader purpose="IMAGE" owner={{ trekId: "trek-1" }} label="Upload photo" />);

    // Extension/MIME type alone can't tell a real image from a disguised
    // file — that's exactly what the server's magic-byte check catches, so
    // the fake reports success client-side but the mocked API rejects it.
    const file = new File(["not actually a jpeg"], "photo.jpg", { type: "image/jpeg" });
    await user.upload(screen.getByLabelText(/upload photo/i), file);

    expect(await screen.findByRole("alert")).toHaveTextContent(/unsupported file type/i);
  });
});
