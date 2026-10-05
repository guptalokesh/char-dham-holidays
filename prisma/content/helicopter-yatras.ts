import type { PackageStep } from "../../src/lib/validation/chardham";

export interface YatraContent {
  id: string;
  slug: string;
  name: string;
  order: number;
  price: number | null;
  dhamChoice: boolean;
  tagline: string;
  routeOverview: string;
  startPoint: string;
  howItStarts: string;
  steps: PackageStep[];
  inclusions: string[];
  importantInfo: string;
  destinations: string[];
  stayInfo: string;
  foodInfo: string;
  travelInfo: string;
}

const WEATHER_NOTE =
  "Flights, darshan and transfers depend on the weather, airspace rules and permissions from the local authorities.";
const BUFFER_NOTE =
  "Keep two to three spare days in your plan in case bad weather delays the flights.";
const LOCAL_SERVICES_NOTE =
  "Porter, pony and palki services are paid for locally and are not part of the package.";

export const YAMUNOTRI_STEP: PackageStep = {
  title: "Yamunotri",
  description:
    "Fly from Sahastradhara Helipad in Dehradun to Kharsali (about 30 to 35 minutes). A short ride takes you to Jankichatti, where a 6.5 km walk, pony or palki ride leads to the Yamunotri Temple, the source of the Yamuna River, at about 10,800 feet. After darshan, return to Kharsali for the night.",
  featured: true,
};

export const GANGOTRI_STEP: PackageStep = {
  title: "Gangotri",
  description:
    "Fly from Kharsali to Jhala Helipad, then drive about 25 km to the Gangotri Temple at about 10,200 feet, where the Ganga is worshipped at her place of origin. The road passes the Bhagirathi River and small mountain villages. After darshan, return to Jhala and on to your hotel.",
  featured: true,
};

export const KEDARNATH_STEP: PackageStep = {
  title: "Kedarnath",
  description:
    "Fly to Phata, then take a short shuttle flight to Kedarnath Helipad. The shuttle runs in time slots allotted by UCADA, the Uttarakhand Civil Aviation Development Authority. From the helipad it is a walk of about 700 metres to the temple, which stands at about 11,755 feet. Porters and ponies are available on site for an extra charge.",
  featured: true,
};

export const BADRINATH_STEP: PackageStep = {
  title: "Badrinath",
  description:
    "Fly from Phata to Badrinath (about 30 minutes, weather permitting). The temple is about 1 km from the helipad; a short drive and a walk of 150 to 200 metres bring you to the entrance, followed by about 25 stone steps. Nearby you can bathe at Tapt Kund and visit Mana village if time allows.",
  featured: true,
};

const CHAR_DHAM: YatraContent = {
  id: "singleton-chardham-package",
  slug: "char-dham",
  name: "Char Dham Yatra by Helicopter",
  order: 1,
  price: 21000,
  dhamChoice: false,
  tagline: "Yamunotri, Gangotri, Kedarnath and Badrinath by helicopter",
  routeOverview:
    "A guided helicopter pilgrimage to all four dhams. You fly between the shrines instead of travelling for days by road, so you spend your time on darshan, not on the journey.",
  startPoint: "Sahastradhara Helipad, Dehradun",
  howItStarts:
    "Your yatra begins in Dehradun, the gateway to the Garhwal Himalayas. Our team meets you on arrival, takes you to your hotel and, in the evening, explains the route, the helicopter rules and the weather outlook. The flights begin the next morning from Sahastradhara Helipad.",
  steps: [
    {
      title: "Arrive in Dehradun",
      description:
        "A driver meets you at Jolly Grant Airport or the railway station and takes you to your hotel. Rest, enjoy dinner and attend the briefing about the plan for the coming days.",
      featured: false,
    },
    YAMUNOTRI_STEP,
    GANGOTRI_STEP,
    KEDARNATH_STEP,
    BADRINATH_STEP,
    {
      title: "Return to Dehradun",
      description:
        "A helicopter flight of about one hour brings you back to Dehradun, and you are then taken to the airport or railway station, where the yatra ends.",
      featured: false,
    },
  ],
  inclusions: [
    "Helicopter flights between the dhams, as per the plan",
    "Hotel stays during the yatra",
    "Meals as per the plan",
    "Pick-up and drop at Dehradun airport or railway station",
    "A briefing before the yatra begins",
    "Assistance and guidance at every dham",
  ],
  importantInfo: [
    WEATHER_NOTE,
    BUFFER_NOTE,
    "Darshan at each dham is the main part of the yatra. Extra sightseeing depends on time and weather.",
    LOCAL_SERVICES_NOTE,
    "Carry warm clothes; Kedarnath is at an altitude of about 11,500 feet.",
  ].join("\n"),
  destinations: ["Yamunotri", "Gangotri", "Kedarnath", "Badrinath"],
  stayInfo: "Included",
  foodInfo: "Included",
  travelInfo: "Included",
};

const ANY_DHAM: YatraContent = {
  id: "singleton-package-any-dham",
  slug: "any-dham",
  name: "Any Dham Yatra by Helicopter",
  order: 2,
  price: null,
  dhamChoice: true,
  tagline: "Visit the dham or dhams you wish, by helicopter",
  routeOverview:
    "Not everyone wants to visit all four dhams. Tell us which dham or dhams you wish to visit, and we will plan the flights, the stay and the darshan around them. The price depends on the dhams, the number of pilgrims and the season.",
  startPoint: "Sahastradhara Helipad, Dehradun",
  howItStarts:
    "Send us a request with the dham or dhams you want to visit and your preferred date. Our team confirms availability, the flight plan and the price, and then helps you with your arrival in Dehradun, where the yatra begins.",
  steps: [
    {
      title: "Tell us your dhams and dates",
      description:
        "Choose one or more of Yamunotri, Gangotri, Kedarnath and Badrinath in the request form, with your preferred date and the number of pilgrims.",
      featured: false,
    },
    {
      title: "We confirm the plan and the price",
      description:
        "Our team checks availability and weather patterns, arranges the helicopter flights and shares the final plan and price with you.",
      featured: false,
    },
    {
      title: "Arrive in Dehradun",
      description:
        "You are received on arrival and attend a short briefing about the flights, the temple visits and the weather guidance.",
      featured: false,
    },
    {
      title: "Fly and have darshan",
      description:
        "You fly to your chosen dham or dhams, have darshan with our assistance and return to the helipad. Details of each dham are given on this page.",
      featured: false,
    },
    {
      title: "Return to Dehradun",
      description:
        "After the last darshan, you fly back to Dehradun and are taken to the airport, the railway station or your hotel.",
      featured: false,
    },
  ],
  inclusions: [
    "Helicopter flights for the dhams you choose",
    "Pick-up and drop in Dehradun",
    "A briefing before the flights",
    "Assistance with darshan at each dham",
  ],
  importantInfo: [
    WEATHER_NOTE,
    BUFFER_NOTE,
    "Kedarnath and Badrinath can often be visited together in a single day from Dehradun when the weather and the shuttle slots allow.",
    LOCAL_SERVICES_NOTE,
  ].join("\n"),
  destinations: ["Yamunotri", "Gangotri", "Kedarnath", "Badrinath"],
  stayInfo: "",
  foodInfo: "",
  travelInfo: "",
};

const HANDLING: YatraContent = {
  id: "singleton-package-handling",
  slug: "yamunotri-gangotri-handling",
  name: "Yamunotri & Gangotri Helicopter Handling",
  order: 3,
  price: null,
  dhamChoice: false,
  tagline: "Ground support for your helicopter visit to Yamunotri and Gangotri",
  routeOverview:
    "A separate service for pilgrims who fly to Yamunotri and Gangotri. Our team looks after the ground side of your visit, from your arrival at the helipad to your return flight, so that you can focus on darshan.",
  startPoint: "Kharsali Helipad (Yamunotri) and Jhala or Harsil Helipad (Gangotri)",
  howItStarts:
    "Share your flight details and dates with us. On the day, our representative meets you at the helipad where your helicopter lands and stays with you until you are back on board.",
  steps: [
    {
      title: "Share your flight details",
      description:
        "Send us your dates, the number of pilgrims and the helipad where you will land, so that our team can plan the ground arrangements.",
      featured: false,
    },
    {
      title: "Welcome at the helipad",
      description:
        "Our representative receives you at Kharsali for Yamunotri, or at Jhala or Harsil for Gangotri, and explains the plan for the visit.",
      featured: false,
    },
    {
      title: "Yamunotri",
      description:
        "From Kharsali, a short ride takes you to Jankichatti, where the 6.5 km walk to the temple begins. We help you arrange a pony, a palki or a porter if you need one (paid locally), and guide you through darshan at the temple of Goddess Yamuna.",
      featured: false,
    },
    {
      title: "Gangotri",
      description:
        "From the helipad, a road journey of about 25 km leads to the Gangotri Temple. We arrange the transfer and guide you through darshan at the place where the Ganga is worshipped at her source.",
      featured: false,
    },
    {
      title: "Return to your helicopter",
      description:
        "After darshan, we take you back to the helipad in time for your return flight and stay with you until you leave.",
      featured: false,
    },
  ],
  inclusions: [
    "Welcome at the helipad",
    "Local transfers between the helipad and the temple, where a road is available",
    "Assistance with darshan",
    "Help in arranging a porter, pony or palki, which is paid locally",
    "Support until your return flight",
  ],
  importantInfo: [
    WEATHER_NOTE,
    "Helicopter seats are not part of this service unless our team has agreed otherwise with you.",
    "Gaumukh, the glacier source of the Ganga, is a separate high-altitude trek that needs a forest permit, and is not included.",
    LOCAL_SERVICES_NOTE,
  ].join("\n"),
  destinations: ["Yamunotri", "Gangotri"],
  stayInfo: "",
  foodInfo: "",
  travelInfo: "",
};

export const HELICOPTER_YATRAS: YatraContent[] = [CHAR_DHAM, ANY_DHAM, HANDLING];
