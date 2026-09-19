import assert from "node:assert/strict";
import { test } from "node:test";
import {
  emptyMarketplace,
  parseMarketplaceState,
} from "./marketplace-empty.ts";
import {
  isUnassignedCreator,
  UNASSIGNED_CREATOR,
  UNASSIGNED_KOL,
} from "./assignment.ts";

test("live marketplace starts empty", () => {
  const live = emptyMarketplace();
  assert.equal(live.reviews.length, 0);
  assert.equal(live.ledger.length, 0);
  assert.equal(live.parties.length, 0);
});

test("corrupt storage falls back instead of throwing", () => {
  const fallback = emptyMarketplace();
  const parsed = parseMarketplaceState("{not json", fallback);
  assert.equal(parsed, fallback);
});

test("live jobs wait for a creator instead of assigning Aisha", () => {
  assert.equal(UNASSIGNED_CREATOR, "Unassigned");
  assert.equal(UNASSIGNED_KOL, "Awaiting match");
  assert.equal(isUnassignedCreator(UNASSIGNED_CREATOR), true);
  assert.equal(isUnassignedCreator("Aisha"), false);
});
