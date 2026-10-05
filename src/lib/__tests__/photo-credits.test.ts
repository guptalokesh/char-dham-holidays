import { describe, expect, it } from "vitest";
import { creditsForUrls } from "@/lib/photo-credits";

describe("creditsForUrls", () => {
  it("returns the credit for each known stock photo, once, in order", () => {
    const credits = creditsForUrls([
      "/seed-images/dham-badrinath.jpg",
      "/seed-images/dham-kedarnath.jpg",
      "/seed-images/dham-badrinath.jpg",
    ]);

    expect(credits.map((c) => c.subject)).toEqual(["Badrinath Temple", "Kedarnath Temple"]);
    expect(credits[0]).toMatchObject({ author: "Vishwanath Negi", license: "CC BY 4.0" });
    expect(credits[0].sourceUrl).toMatch(/^https:\/\/commons\.wikimedia\.org\//);
  });

  it("ignores photos that need no credit, such as the owner's own, and missing urls", () => {
    expect(creditsForUrls(["/seed-images/hotel-exterior.jpg", undefined, "/uploads/x.jpg"])).toEqual([]);
  });

  it("gives every openly licensed stock photo an author, a licence and a source link", () => {
    const all = creditsForUrls([
      "/seed-images/dham-yamunotri.jpg",
      "/seed-images/dham-gangotri.jpg",
      "/seed-images/dham-kedarnath.jpg",
      "/seed-images/dham-badrinath.jpg",
      "/seed-images/yatra-helicopter.jpg",
    ]);

    expect(all).toHaveLength(5);
    for (const credit of all) {
      expect(credit.author).toBeTruthy();
      expect(credit.license).toBeTruthy();
      expect(credit.sourceUrl).toBeTruthy();
    }
  });
});
