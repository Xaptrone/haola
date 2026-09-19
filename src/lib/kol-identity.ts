import type { Kol } from "./types";

export type KolLookId = "mei-lin" | "aisyah" | "jia" | "ravi" | "farah" | "siti";

export type KolLook = {
  id: KolLookId;
  name: string;
  kicker: string;
  line: string;
  world: string;
  voice: string;
  language: string;
  city: string;
  categories: string;
  tribes: string[];
  names: string[];
  fit: number;
};

export type KolProposal = {
  lookId: KolLookId;
  name: string;
  body: string;
  world: string;
  voice: string;
  audience: string;
  language: string;
  market: string;
  categories: string;
  personality: string;
  amf: number;
  factors: { label: string; value: string }[];
};

const BUYER_SEGMENTS = [
  "25–34 brand explorers",
  "Premium regulars",
  "Weekend group buyers",
];

export const KOL_LOOKS: KolLook[] = [
  {
    id: "mei-lin",
    name: "Mei Lin",
    kicker: "F&B",
    line: "Warm host. Never shouty.",
    world: "F&B",
    voice: "Warm and precise",
    language: "EN / 中文",
    city: "Kuala Lumpur",
    categories: "F&B",
    tribes: [
      "KL foodies",
      "Weekend family tables",
      "Chinese-speaking foodies",
      "Campus first-timers",
    ],
    names: ["Mei Lin", "Wei Ling", "Hui Min"],
    fit: 84,
  },
  {
    id: "aisyah",
    name: "Aisyah",
    kicker: "Beauty",
    line: "Soft. Close. BM and EN.",
    world: "Beauty",
    voice: "Soft and close",
    language: "BM / EN",
    city: "Kuala Lumpur",
    categories: "Beauty",
    tribes: [
      "Beauty girls",
      "Skincare routine crowd",
      "Modest glam",
      "Campus 18–24",
    ],
    names: ["Aisyah", "Nurul", "Sofea"],
    fit: 82,
  },
  {
    id: "jia",
    name: "Jia",
    kicker: "Lifestyle",
    line: "Dry. 中文. No hype.",
    world: "Lifestyle",
    voice: "Dry humor",
    language: "中文 / EN",
    city: "Kuala Lumpur",
    categories: "Lifestyle",
    tribes: [
      "Chinese-speaking lifestyle",
      "KL office millennials",
      "Dry-humour scrollers",
      "Weekend mall wanderers",
    ],
    names: ["Jia", "Xin Yi", "Li Hua"],
    fit: 80,
  },
  {
    id: "ravi",
    name: "Ravi",
    kicker: "Property",
    line: "Calm. Explains the number.",
    world: "Property",
    voice: "Calm expert",
    language: "EN / BM",
    city: "Klang Valley",
    categories: "Property",
    tribes: [
      "First-home hunters",
      "Young couples in KV",
      "Parents buying up",
      "New-launch watchers",
    ],
    names: ["Ravi", "Arjun", "Kumar"],
    fit: 83,
  },
  {
    id: "farah",
    name: "Farah",
    kicker: "Family",
    line: "For the school run, not the ad.",
    world: "Family",
    voice: "Warm and precise",
    language: "EN / BM",
    city: "Klang Valley",
    categories: "Family",
    tribes: [
      "Young mums",
      "Family weekends",
      "School-run KL",
      "First-time parents",
    ],
    names: ["Farah", "Amira", "Hana"],
    fit: 81,
  },
  {
    id: "siti",
    name: "Siti",
    kicker: "Street",
    line: "Night market energy. Real.",
    world: "Street",
    voice: "Bold and playful",
    language: "BM / EN",
    city: "Kuala Lumpur",
    categories: "Street",
    tribes: [
      "Night-market crowd",
      "Street food hunters",
      "Late-night KL",
      "Neighbourhood regulars",
    ],
    names: ["Siti", "Aina", "Zahra"],
    fit: 79,
  },
];

export function lookById(id: string): KolLook | null {
  return KOL_LOOKS.find((look) => look.id === id) ?? null;
}

function lineFor(look: KolLook, name: string, tribe: string) {
  switch (look.id) {
    case "mei-lin":
      return `${name} talks like a host, not an ad. ${tribe} stay for the table, not the shout.`;
    case "aisyah":
      return `${name} stays close to the mirror. ${tribe} trust a routine they can actually keep.`;
    case "jia":
      return `${name} is dry on purpose. ${tribe} follow the cut, not the caption.`;
    case "ravi":
      return `${name} slows the number down. ${tribe} want a person who has read the plan.`;
    case "farah":
      return `${name} speaks to the school run. ${tribe} do not need a brand lecture.`;
    case "siti":
      return `${name} shoots the stall, not the studio. ${tribe} can smell the night market.`;
    default: {
      const _never: never = look.id;
      throw new Error(`Unhandled look: ${_never}`);
    }
  }
}

export function proposeKol(input: {
  lookId: string;
  tribe: string;
  regen?: number;
}): KolProposal | null {
  const look = lookById(input.lookId);
  if (!look) return null;
  const tribe = look.tribes.includes(input.tribe) ? input.tribe : look.tribes[0];
  if (!tribe) return null;
  const names = look.names.length ? look.names : [look.name];
  const index = Math.abs(input.regen ?? 0) % names.length;
  const name = names[index] ?? look.name;
  return {
    lookId: look.id,
    name,
    body: lineFor(look, name, tribe),
    world: look.world,
    voice: look.voice,
    audience: tribe,
    language: look.language,
    market: look.city,
    categories: look.categories,
    personality: look.voice,
    amf: look.fit,
    factors: [
      { label: "World", value: `${look.world} · not a generalist` },
      { label: "Comments", value: tribe },
      { label: "Voice", value: `${look.voice} · ${look.language}` },
    ],
  };
}

export function kolFromProposal(proposal: KolProposal, id: string): Kol {
  return {
    id,
    name: proposal.name,
    market: proposal.market,
    audience: proposal.audience,
    categories: proposal.categories,
    language: proposal.language,
    personality: proposal.personality,
    amf: proposal.amf,
  };
}

export function appendKol(existing: Kol[], next: Kol): Kol[] {
  if (existing.some((kol) => kol.id === next.id)) return existing;
  return [...existing, next];
}

export function namesInWorld(kols: Kol[], world: string) {
  return kols
    .filter((kol) => kol.categories === world)
    .map((kol) => kol.name);
}

export function buyerSegmentLabels() {
  return BUYER_SEGMENTS.slice();
}

export function allTribes() {
  return KOL_LOOKS.flatMap((look) => look.tribes);
}
