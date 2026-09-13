import assert from "node:assert/strict";
import { test } from "node:test";
import { upsertBrand } from "./brands.ts";

test("upsertBrand adds a new name", () => {
  const next = upsertBrand([], "Klinik Harmoni");
  assert.equal(next.length, 1);
  assert.equal(next[0]?.name, "Klinik Harmoni");
});

test("upsertBrand ignores blank and duplicate names", () => {
  const first = upsertBrand([], "Atelier Atas");
  const again = upsertBrand(first, " atelier atas ");
  assert.equal(again.length, 1);
  assert.equal(upsertBrand(first, "   ").length, 1);
});
