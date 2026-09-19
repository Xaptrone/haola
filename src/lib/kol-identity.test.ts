import assert from "node:assert/strict";
import { test } from "node:test";
import {
  allTribes,
  appendKol,
  buyerSegmentLabels,
  KOL_LOOKS,
  kolFromProposal,
  lookById,
  namesInWorld,
  proposeKol,
} from "./kol-identity.ts";

test("six looks cover distinct worlds", () => {
  assert.equal(KOL_LOOKS.length, 6);
  const worlds = new Set(KOL_LOOKS.map((look) => look.world));
  assert.equal(worlds.size, 6);
  assert.deepEqual(
    KOL_LOOKS.map((look) => look.id),
    ["mei-lin", "aisyah", "jia", "ravi", "farah", "siti"],
  );
});

test("tribes are follower communities, not buyer CRM segments", () => {
  const banned = buyerSegmentLabels();
  const tribes = allTribes();
  for (const label of banned) {
    assert.equal(tribes.includes(label), false, label);
  }
  assert.ok(tribes.includes("KL foodies"));
  assert.ok(tribes.includes("First-home hunters"));
  assert.ok(tribes.includes("Night-market crowd"));
});

test("proposeKol is not always Mei Lin", () => {
  const ravi = proposeKol({ lookId: "ravi", tribe: "First-home hunters" });
  assert.ok(ravi);
  assert.equal(ravi?.name, "Ravi");
  assert.equal(ravi?.world, "Property");
  assert.equal(ravi?.audience, "First-home hunters");
  assert.ok(!ravi?.body.includes("brand explorers"));
});

test("proposeKol regen rotates the name on the same look", () => {
  const first = proposeKol({ lookId: "aisyah", tribe: "Beauty girls", regen: 0 });
  const second = proposeKol({ lookId: "aisyah", tribe: "Beauty girls", regen: 1 });
  assert.equal(first?.name, "Aisyah");
  assert.equal(second?.name, "Nurul");
  assert.equal(first?.world, second?.world);
});

test("unknown look returns null", () => {
  assert.equal(proposeKol({ lookId: "nope", tribe: "KL foodies" }), null);
});

test("lookById finds a seed", () => {
  assert.equal(lookById("siti")?.city, "Kuala Lumpur");
  assert.equal(lookById("missing"), null);
});

test("appendKol keeps the first talent", () => {
  const mei = kolFromProposal(
    proposeKol({ lookId: "mei-lin", tribe: "KL foodies" })!,
    "kol-1",
  );
  const ravi = kolFromProposal(
    proposeKol({ lookId: "ravi", tribe: "First-home hunters" })!,
    "kol-2",
  );
  const next = appendKol([mei], ravi);
  assert.equal(next.length, 2);
  assert.equal(next[0]?.name, "Mei Lin");
  assert.equal(next[1]?.name, "Ravi");
  assert.equal(appendKol(next, ravi).length, 2);
});

test("namesInWorld lists talent already in a world", () => {
  const mei = kolFromProposal(
    proposeKol({ lookId: "mei-lin", tribe: "KL foodies" })!,
    "kol-1",
  );
  assert.deepEqual(namesInWorld([mei], "F&B"), ["Mei Lin"]);
  assert.deepEqual(namesInWorld([mei], "Beauty"), []);
});
