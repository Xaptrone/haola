import { adminTopup, holdForJob } from "@/lib/credits";
import {
  AISHA_CREATOR_ID,
  ASIAM_BUSINESS_ID,
  seedReviews,
} from "@/lib/review";
import {
  emptyMarketplace,
  type MarketplaceState,
} from "@/lib/marketplace-empty";
import type { LedgerEntry } from "@/lib/types";

export {
  emptyMarketplace,
  LIVE_MARKET_KEY,
  parseMarketplaceState,
  PREVIEW_MARKET_KEY,
  type MarketplaceState,
} from "@/lib/marketplace-empty";

export function demoMarketplace(): MarketplaceState {
  const reviews = seedReviews();
  let ledger: LedgerEntry[] = [];
  const top = adminTopup(ledger, {
    businessId: ASIAM_BUSINESS_ID,
    amount: 5000,
    actor: "Nadia",
    note: "Opening balance",
    idempotencyKey: "topup:seed:bws-asiam",
  });
  ledger = top.entries;
  for (const job of reviews) {
    const held = holdForJob(ledger, job, "system");
    if (held.ok) ledger = held.entries;
  }
  return {
    ...emptyMarketplace(),
    reviews,
    ledger,
    parties: [
      { id: ASIAM_BUSINESS_ID, name: "As I Am by Chef Ton", kind: "business" },
      { id: AISHA_CREATOR_ID, name: "Aisha", kind: "creator" },
    ],
  };
}
