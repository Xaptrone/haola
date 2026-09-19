import assert from "node:assert/strict";
import { test } from "node:test";
import {
  KOL_AUDIENCES,
  KOL_CRAFTS,
  KOL_VOICES,
  amfFromBrief,
  languageFromVoice,
  nameFromBrief,
  personalityFromVoice,
  proposeKol,
} from "./kol-brief.ts";

test("audience casting has more than three shopper chips", () => {
  assert.equal(KOL_AUDIENCES.length, 6);
  assert.ok(KOL_AUDIENCES.includes("25–34 brand explorers"));
  assert.ok(KOL_AUDIENCES.includes("18–24 campus and first jobs"));
  assert.ok(KOL_AUDIENCES.includes("Office lunch and after-work"));
});

test("names the avatar from craft and voice, not a fixed Mei Lin", () => {
  assert.equal(
    nameFromBrief({ craft: "F&B and cafes", voice: "EN / 中文 · low-key" }),
    "Mei Lin",
  );
  assert.equal(
    nameFromBrief({ craft: "Beauty and wellness", voice: "BM / EN · warm" }),
    "Nadia",
  );
  assert.equal(
    nameFromBrief({
      craft: "Lifestyle and services",
      voice: "EN · short and sharp",
    }),
    "Elena",
  );
});

test("voice sets language and personality", () => {
  assert.equal(languageFromVoice("BM / EN · warm"), "BM / EN");
  assert.equal(personalityFromVoice("EN · short and sharp"), "Clean, short, never shouty");
});

test("proposal card copy uses the brief the creator tapped", () => {
  const card = proposeKol({
    market: "Penang",
    audience: "25–34 brand explorers",
    craft: "F&B and cafes",
    voice: "EN / 中文 · low-key",
  });
  assert.equal(card.name, "Mei Lin");
  assert.equal(card.categories, "F&B and cafes");
  assert.equal(card.language, "EN / 中文");
  assert.match(card.body, /25–34 brand explorers/);
  assert.equal(typeof card.amf, "number");
  assert.ok(card.amf >= 78 && card.amf <= 88);
});

test("each craft and voice pair names a different avatar", () => {
  const names = KOL_CRAFTS.flatMap((craft) =>
    KOL_VOICES.map((voice) => nameFromBrief({ craft, voice })),
  );
  assert.equal(new Set(names).size, names.length);
});

test("both-markets and bilingual voice lift predicted AMF", () => {
  const base = amfFromBrief({
    market: "Penang",
    audience: "Weekend group buyers",
    craft: "F&B and cafes",
    voice: "EN · short and sharp",
  });
  const lifted = amfFromBrief({
    market: "Both KL and Penang",
    audience: "25–34 brand explorers",
    craft: "F&B and cafes",
    voice: "EN / 中文 · low-key",
  });
  assert.ok(lifted > base);
});
