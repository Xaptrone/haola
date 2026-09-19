import assert from "node:assert/strict";
import { test } from "node:test";
import { emptyMarketplace } from "./marketplace-empty.ts";
import {
  businessOversight,
  creatorOversight,
} from "./oversight-metrics.ts";

test("live oversight is empty until real jobs exist", () => {
  const live = emptyMarketplace();
  const biz = businessOversight(live.reviews, live.ledger);
  assert.equal(biz.approvalsWaiting, 0);
  assert.equal(biz.liveCampaigns, 0);
  assert.equal(biz.spendCredits, 0);
  assert.equal(creatorOversight(live.parties, live.reviews).length, 0);
});
