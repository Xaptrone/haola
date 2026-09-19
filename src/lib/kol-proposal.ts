export type KolProposalInput = {
  name: string;
  market: string;
  audience: string;
};

export type KolProposal = {
  name: string;
  market: string;
  audience: string;
  categories: string;
  language: string;
  personality: string;
};

export function languageForMarket(market: string): string {
  if (market.includes("Penang") && (market.includes("KL") || market.includes("Kuala"))) {
    return "EN / 中文";
  }
  if (market.includes("Penang")) return "EN / 中文 / BM";
  return "EN / BM";
}

export function kolProposal(input: KolProposalInput): KolProposal {
  const name = input.name.trim();
  return {
    name,
    market: input.market,
    audience: input.audience,
    categories: "Lifestyle, services, F&B",
    language: languageForMarket(input.market),
    personality: "Warm, precise, never shouty",
  };
}
