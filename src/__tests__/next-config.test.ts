// @vitest-environment node
import { describe, expect, it } from "vitest";
import nextConfig from "../../next.config";

describe("next.config redirects", () => {
  it("sends the old /chardham page to the Char Dham yatra page, without a permanent cache", async () => {
    const redirects = await nextConfig.redirects!();

    expect(redirects).toContainEqual({
      source: "/chardham",
      destination: "/yatra/char-dham",
      permanent: false,
    });
  });

  it("sends the old Devrana page to the Devrana section on the Trekking page", async () => {
    const redirects = await nextConfig.redirects!();

    expect(redirects).toContainEqual({
      source: "/devrana-mandir",
      destination: "/trekking#devrana-mandir",
      permanent: false,
    });
  });
});
