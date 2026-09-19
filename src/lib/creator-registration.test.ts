import assert from "node:assert/strict";
import { test } from "node:test";
import {
  creatorNameError,
  isUsableCreatorName,
  parseCreatorHandle,
  studioNameFromCreator,
  suggestCreatorName,
} from "./creator-registration.ts";

test("accepts a creator name brands would call them", () => {
  assert.equal(isUsableCreatorName("Aisha"), true);
  assert.equal(isUsableCreatorName("  mei lin  "), true);
  assert.equal(creatorNameError("Aisha"), null);
});

test("rejects business names, phones, and emails", () => {
  assert.equal(isUsableCreatorName("My studio"), false);
  assert.equal(isUsableCreatorName("Business name"), false);
  assert.equal(isUsableCreatorName("My business"), false);
  assert.equal(isUsableCreatorName("+60 12-345 6789"), false);
  assert.equal(isUsableCreatorName("60123456789"), false);
  assert.equal(isUsableCreatorName("aisha@brand.my"), false);
  assert.match(
    creatorNameError("My business") ?? "",
    /creator name, not a business name/,
  );
});

test("names a studio from the creator, not a company", () => {
  assert.equal(studioNameFromCreator("Aisha"), "Aisha's studio");
  assert.equal(studioNameFromCreator(""), "Studio");
});

test("keeps a name that already ends in Studio", () => {
  assert.equal(isUsableCreatorName("Aisha Studio"), true);
  assert.equal(studioNameFromCreator("Aisha Studio"), "Aisha Studio");
});

test("does not suggest WhatsApp phone as a creator name", () => {
  assert.equal(
    suggestCreatorName({
      id: "wa:60123456789",
      name: "+60 12-345 6789",
      email: "60123456789@whatsapp.local",
    }),
    "",
  );
});

test("suggests a Google or email name when it is usable", () => {
  assert.equal(
    suggestCreatorName({
      id: "google:1",
      name: "Aisha Tan",
      email: "aisha@gmail.com",
    }),
    "Aisha Tan",
  );
  assert.equal(
    suggestCreatorName({
      id: "email:mei.lin@studio.my",
      name: "my studio",
      email: "mei.lin@studio.my",
    }),
    "mei lin",
  );
});

test("parses optional Instagram handles", () => {
  assert.deepEqual(parseCreatorHandle(""), {});
  assert.deepEqual(parseCreatorHandle("@aisha"), { handle: "aisha" });
  assert.deepEqual(parseCreatorHandle("mei.lin"), { handle: "mei.lin" });
  assert.deepEqual(parseCreatorHandle("https://www.instagram.com/chelseaxu1225/"), {
    handle: "chelseaxu1225",
  });
  assert.equal(parseCreatorHandle("nope!!").error, "Use an Instagram handle, like @aisha.");
});
