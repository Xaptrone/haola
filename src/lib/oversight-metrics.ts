import type { LedgerEntry, MarketplaceParty, ReviewJob } from "./types";

export type BusinessOversight = {
  approvalsWaiting: number;
  liveCampaigns: number;
  spendCredits: number;
};

export type CreatorOversight = {
  id: string;
  name: string;
  liveCampaigns: number;
  jobs: ReviewJob[];
};

export function businessOversight(
  reviews: ReviewJob[],
  ledger: LedgerEntry[],
): BusinessOversight {
  return {
    approvalsWaiting: reviews.filter((j) => j.waitingOn === "business").length,
    liveCampaigns: reviews.filter((j) => j.waitingOn !== "done").length,
    spendCredits: ledger
      .filter((e) => e.reason === "hold")
      .reduce((sum, e) => sum + e.amount, 0),
  };
}

export function creatorOversight(
  parties: MarketplaceParty[],
  reviews: ReviewJob[],
): CreatorOversight[] {
  return parties
    .filter((p) => p.kind === "creator")
    .map((p) => {
      const jobs = reviews.filter((j) => j.creatorName === p.name);
      return {
        id: p.id,
        name: p.name,
        liveCampaigns: jobs.filter((j) => j.waitingOn !== "done").length,
        jobs,
      };
    });
}
