import assert from "node:assert/strict";
import { test } from "node:test";
import { campaignTreatment, displayBrandName } from "./campaign-treatment.ts";

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
