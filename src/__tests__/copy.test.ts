// @vitest-environment node
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = path.resolve(__dirname, "../..");
const SCAN_DIRS = ["src", "prisma/content"];
const SKIP = [/__tests__/, /generated/, /\.test\./];

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    if (SKIP.some((re) => re.test(full))) return [];
    return statSync(full).isDirectory() ? files(full) : /\.(tsx?|css)$/.test(name) ? [full] : [];
  });
}

const BANNED: [RegExp, string][] = [
  [/organiser/, 'use "our team" instead of "organiser"'],
  [/Sri Kedarnath/, 'write "Kedarnath"'],
  [/Chardham Yatra/, 'write "Char Dham Yatra" (two words)'],
  [/[Tt]hree (journeys|ways|experiences)/, "do not hard-code how many offerings there are"],
  [/currently unavailable/, 'use "not available at the moment" style wording'],
];

describe("public copy", () => {
  const sources = SCAN_DIRS.flatMap((dir) => files(path.join(ROOT, dir)));

  for (const [pattern, advice] of BANNED) {
    it(`never contains ${pattern} (${advice})`, () => {
      const offenders = sources.filter((file) => pattern.test(readFileSync(file, "utf8")));
      expect(offenders.map((f) => path.relative(ROOT, f))).toEqual([]);
    });
  }
});
