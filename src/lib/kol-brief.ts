export const KOL_AUDIENCES = [
  "18–24 campus and first jobs",
  "25–34 brand explorers",
  "35–44 family decision makers",
  "Premium regulars",
  "Weekend group buyers",
  "Office lunch and after-work",
] as const;

export const KOL_CRAFTS = [
  "F&B and cafes",
  "Beauty and wellness",
  "Lifestyle and services",
] as const;

export const KOL_VOICES = [
  "EN / 中文 · low-key",
  "BM / EN · warm",
  "EN · short and sharp",
] as const;

export type KolAudience = (typeof KOL_AUDIENCES)[number];
export type KolCraft = (typeof KOL_CRAFTS)[number];
export type KolVoice = (typeof KOL_VOICES)[number];

export type KolBrief = {
  market: string;
  audience: string;
  craft: string;
  voice: string;
};

function asCraft(value: string): KolCraft {
  switch (value) {
    case "F&B and cafes":
    case "Beauty and wellness":
    case "Lifestyle and services":
      return value;
    default:
      return "Lifestyle and services";
  }
}

function asVoice(value: string): KolVoice {
  switch (value) {
    case "EN / 中文 · low-key":
    case "BM / EN · warm":
    case "EN · short and sharp":
      return value;
    default:
      return "EN / 中文 · low-key";
  }
}

export function languageFromVoice(voice: string) {
  const v = asVoice(voice);
  switch (v) {
    case "EN / 中文 · low-key":
      return "EN / 中文";
    case "BM / EN · warm":
      return "BM / EN";
    case "EN · short and sharp":
      return "EN";
    default: {
      const _never: never = v;
      return _never;
    }
  }
}

export function personalityFromVoice(voice: string) {
  const v = asVoice(voice);
  switch (v) {
    case "EN / 中文 · low-key":
      return "Warm, precise, never shouty";
    case "BM / EN · warm":
      return "Easy, close, never salesy";
    case "EN · short and sharp":
      return "Clean, short, never shouty";
    default: {
      const _never: never = v;
      return _never;
    }
  }
}

export function nameFromBrief(brief: Pick<KolBrief, "craft" | "voice">) {
  const craft = asCraft(brief.craft);
  const voice = asVoice(brief.voice);
  switch (craft) {
    case "F&B and cafes":
      switch (voice) {
        case "EN / 中文 · low-key":
          return "Mei Lin";
        case "BM / EN · warm":
          return "Iman";
        case "EN · short and sharp":
          return "Lara";
        default: {
          const _never: never = voice;
          return _never;
        }
      }
    case "Beauty and wellness":
      switch (voice) {
        case "EN / 中文 · low-key":
          return "Jia";
        case "BM / EN · warm":
          return "Nadia";
        case "EN · short and sharp":
          return "Hana";
        default: {
          const _never: never = voice;
          return _never;
        }
      }
    case "Lifestyle and services":
      switch (voice) {
        case "EN / 中文 · low-key":
          return "Xin";
        case "BM / EN · warm":
          return "Aisha";
        case "EN · short and sharp":
          return "Elena";
        default: {
          const _never: never = voice;
          return _never;
        }
      }
    default: {
      const _never: never = craft;
      return _never;
    }
  }
}

export function amfFromBrief(brief: KolBrief) {
  let score = 78;
  if (brief.market === "Both KL and Penang") score += 2;
  if (brief.voice.includes("/")) score += 2;
  if (brief.audience.includes("25–34") || brief.audience.includes("Premium")) {
    score += 2;
  }
  if (score > 88) score = 88;
  return score;
}

export function proposeKol(brief: KolBrief) {
  const name = nameFromBrief(brief);
  const personality = personalityFromVoice(brief.voice);
  const language = languageFromVoice(brief.voice);
  return {
    name,
    personality,
    language,
    categories: asCraft(brief.craft),
    body: `${personality}. Speaks to ${brief.audience}.`,
    amf: amfFromBrief(brief),
  };
}
