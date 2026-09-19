import assert from "node:assert/strict";
import { test } from "node:test";
import {
  campaignTreatment,
  displayBrandName,
  liveMatchCopy,
  shouldShowGuestDraft,
} from "./campaign-treatment.ts";

test("displayBrandName hides placeholder names", () => {
  assert.equal(displayBrandName("Klinik Harmoni SS15"), "Klinik Harmoni SS15");
  assert.equal(displayBrandName("To confirm"), "Your business");
  assert.equal(displayBrandName("  "), "Your business");
});

test("campaignTreatment names the brand in the hook and the name beat", () => {
  const next = campaignTreatment("Klinik Harmoni SS15", "Bookings");
  assert.match(next.hook, /Klinik Harmoni SS15/);
  assert.equal(next.beats.length, 3);
  assert.match(next.beats[1]?.line ?? "", /Klinik Harmoni SS15/);
});

test("campaignTreatment has a distinct close per goal", () => {
  assert.match(campaignTreatment("Atelier Atas", "Bookings").beats[2]!.line, /booking/i);
  assert.match(campaignTreatment("Atelier Atas", "A new offer").beats[2]!.line, /offer/i);
  assert.match(campaignTreatment("Atelier Atas", "Awareness").hook, /Who Atelier Atas is for/);
});

test("live match copy never names a demo KOL", () => {
  const copy = liveMatchCopy("Kedai Live Test");
  assert.match(copy.title, /match a virtual KOL/i);
  assert.match(copy.body, /Kedai Live Test/);
  assert.doesNotMatch(copy.title, /Mei Lin|Aisha|Chef Ton/i);
  assert.doesNotMatch(copy.body, /Mei Lin|Aisha|Chef Ton/i);
});

test("guest draft overlay does not trap Continue on create", () => {
  assert.equal(shouldShowGuestDraft(true, "idle", "home"), true);
  assert.equal(shouldShowGuestDraft(true, "idle", "create"), false);
  assert.equal(shouldShowGuestDraft(true, "business", "home"), false);
  assert.equal(shouldShowGuestDraft(false, "idle", "home"), false);
});
