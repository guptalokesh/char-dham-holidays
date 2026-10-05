// @vitest-environment node
import { describe, expect, it } from "vitest";
import { HELICOPTER_YATRAS } from "../content/helicopter-yatras";

// The itinerary text should stay true when helipads, slots or flight times
// change, so it must not name them. Dham names and the city Dehradun are fine.
const SPECIFIC_NAMES = /Sahastradhara|Kharsali|Jhala|Harsil|Phata|Jankichatti|Jolly Grant|UCADA|Tapt Kund|Mana village|Bhagirathi/;
const MEASUREMENTS = /\d[\d.,]*\s?(km|kilometres|metres|meters|feet|ft|minutes?|hours?)\b/i;
const OTHER_SPECIFICS = /stone steps|one hour|about \d/i;

function allText(yatra: (typeof HELICOPTER_YATRAS)[number]): string[] {
  return [
    yatra.tagline,
    yatra.routeOverview,
    yatra.startPoint,
    yatra.howItStarts,
    yatra.importantInfo,
    ...yatra.inclusions,
    ...yatra.steps.flatMap((s) => [s.title, s.description]),
  ];
}

describe("seeded yatra wording stays general", () => {
  for (const yatra of HELICOPTER_YATRAS) {
    it(`${yatra.slug}: no helipad, village or authority names`, () => {
      expect(allText(yatra).filter((t) => SPECIFIC_NAMES.test(t))).toEqual([]);
    });

    it(`${yatra.slug}: no distances, altitudes or flight times`, () => {
      expect(allText(yatra).filter((t) => MEASUREMENTS.test(t) || OTHER_SPECIFICS.test(t))).toEqual([]);
    });
  }

  it("still starts in the city of Dehradun, without naming a helipad", () => {
    const charDham = HELICOPTER_YATRAS.find((y) => y.slug === "char-dham")!;
    const any = HELICOPTER_YATRAS.find((y) => y.slug === "any-dham")!;

    expect(charDham.startPoint).toBe("Dehradun");
    expect(any.startPoint).toBe("Dehradun");
    expect(charDham.howItStarts).toMatch(/Dehradun/);
  });

  it("describes the handling service start as the helipad where the helicopter lands", () => {
    const handling = HELICOPTER_YATRAS.find((y) => y.slug === "yamunotri-gangotri-handling")!;

    expect(handling.startPoint).toBe("The helipad where your helicopter lands");
  });
});
