import assert from "node:assert/strict";
import { test } from "node:test";
import { kolProposal, languageForMarket } from "./kol-proposal.ts";

test("kol proposal uses the name the creator typed", () => {
  const next = kolProposal({
    name: "  Nara  ",
    market: "Kuala Lumpur",
    audience: "Premium regulars",
  });
  assert.equal(next.name, "Nara");
  assert.equal(next.market, "Kuala Lumpur");
  assert.doesNotMatch(next.name, /Mei Lin/i);
});

test("language follows the market the creator picked", () => {
  assert.equal(languageForMarket("Kuala Lumpur"), "EN / BM");
  assert.equal(languageForMarket("Penang"), "EN / 中文 / BM");
  assert.equal(languageForMarket("Both KL and Penang"), "EN / 中文");
});
