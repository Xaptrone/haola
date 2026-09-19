import type {
  BrandIpJob,
  LedgerEntry,
  MarketplaceParty,
  ReviewJob,
  SpendRequest,
} from "./types";

export const LIVE_MARKET_KEY = "fxgen.marketplace.live.v1";
export const PREVIEW_MARKET_KEY = "fxgen.marketplace.preview.v1";

export type MarketplaceState = {
  reviews: ReviewJob[];
  ipJobs: BrandIpJob[];
  spendRequests: SpendRequest[];
  ledger: LedgerEntry[];
  parties: MarketplaceParty[];
};

export function emptyMarketplace(): MarketplaceState {
  return {
    reviews: [],
    ipJobs: [],
    spendRequests: [],
    ledger: [],
    parties: [],
  };
}

export function parseMarketplaceState(
  raw: string,
  fallback: MarketplaceState,
): MarketplaceState {
  try {
    const parsed = JSON.parse(raw) as MarketplaceState;
    if (!parsed.reviews || !parsed.ledger) return fallback;
    return {
      reviews: parsed.reviews,
      ipJobs: parsed.ipJobs ?? [],
      spendRequests: parsed.spendRequests ?? [],
      ledger: parsed.ledger,
      parties: parsed.parties ?? fallback.parties,
    };
  } catch {
    return fallback;
  }
}
