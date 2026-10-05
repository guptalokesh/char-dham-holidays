export interface PhotoCredit {
  subject: string;
  author: string;
  license: string;
  licenseUrl?: string;
  sourceUrl: string;
  note?: string;
}

// Openly licensed photos from Wikimedia Commons, used until the owner's own
// photos replace them. Keep in step with images/ATTRIBUTIONS.md.
const PHOTO_CREDITS: Record<string, PhotoCredit> = {
  "/seed-images/dham-yamunotri.jpg": {
    subject: "Yamunotri Temple",
    author: "AaS",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Yamunotri_shrine.jpg",
  },
  "/seed-images/dham-gangotri.jpg": {
    subject: "Gangotri Temple",
    author: "Atarax42",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Gangotri_temple.jpg",
    note: "cropped",
  },
  "/seed-images/dham-kedarnath.jpg": {
    subject: "Kedarnath Temple",
    author: "Shaq774 (en.wikipedia)",
    license: "Public domain",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Kedarnath_Temple.jpg",
  },
  "/seed-images/dham-badrinath.jpg": {
    subject: "Badrinath Temple",
    author: "Vishwanath Negi",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Badrinath_Temple,_Uttarakhand_(Photo-_Vishwanath_Negi).jpg",
  },
  "/seed-images/yatra-helicopter.jpg": {
    subject: "Helicopter taking pilgrims to Kedarnath",
    author: "Asdelhi95",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:A_helicopter_taking_pilgrims_to_kedarnath.jpg",
  },
};

export function creditsForUrls(urls: (string | null | undefined)[]): PhotoCredit[] {
  const seen = new Set<string>();
  const credits: PhotoCredit[] = [];
  for (const url of urls) {
    if (!url || seen.has(url) || !(url in PHOTO_CREDITS)) continue;
    seen.add(url);
    credits.push(PHOTO_CREDITS[url]);
  }
  return credits;
}
