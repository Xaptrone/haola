export type CampaignBeat = {
  n: string;
  title: string;
  line: string;
};

export type CampaignTreatment = {
  hook: string;
  beats: [CampaignBeat, CampaignBeat, CampaignBeat];
};

export function displayBrandName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed || trimmed === "To confirm") return "Your business";
  return trimmed;
}

/** Live guest/create copy. Never names a demo KOL as the match. */
export function liveMatchCopy(brand: string): { title: string; body: string } {
  return {
    title: "We'll match a virtual KOL",
    body: `Predicted fit after a creator claims this. Same market as ${displayBrandName(brand)}.`,
  };
}

export function campaignTreatment(
  businessName: string,
  goal: string,
): CampaignTreatment {
  const brand = displayBrandName(businessName);

  if (goal === "A new offer") {
    return {
      hook: `The thing that changed. Then ${brand}.`,
      beats: [
        { n: "01", title: "Open", line: "The new thing. No speech yet." },
        { n: "02", title: "Name", line: `Say ${brand} once.` },
        { n: "03", title: "Close", line: "The offer. Then stop." },
      ],
    };
  }

  if (goal === "A promotion") {
    return {
      hook: `${brand}, this week only. Keep it in the room.`,
      beats: [
        { n: "01", title: "Open", line: "The room, already open." },
        { n: "02", title: "Name", line: `Say ${brand} once.` },
        { n: "03", title: "Close", line: "The window. Not a countdown." },
      ],
    };
  }

  if (goal === "Awareness") {
    return {
      hook: `Who ${brand} is for. Not a slogan.`,
      beats: [
        { n: "01", title: "Open", line: "Hands at work. No logo." },
        { n: "02", title: "Name", line: `Say ${brand} once.` },
        { n: "03", title: "Close", line: "Who it’s for. Hold." },
      ],
    };
  }

  return {
    hook: `Walk in. Then say ${brand} once.`,
    beats: [
      { n: "01", title: "Open", line: "Street, then the door." },
      { n: "02", title: "Name", line: `Say ${brand} once.` },
      { n: "03", title: "Close", line: "A booking. Quiet." },
    ],
  };
}
