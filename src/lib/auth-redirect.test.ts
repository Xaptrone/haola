import assert from "node:assert/strict";
import { test } from "node:test";
import { sameOriginContinuePath } from "./auth-redirect.ts";

test("keeps a relative callback", () => {
  assert.equal(
    sameOriginContinuePath(
      "/start?intent=creator",
      "/start",
      "http://localhost:3000",
    ),
    "/start?intent=creator",
  );
});

test("strips a same-origin absolute url to a path", () => {
  assert.equal(
    sameOriginContinuePath(
      "http://localhost:3000/start?intent=creator",
      "/start",
      "http://localhost:3000",
    ),
    "/start?intent=creator",
  );
});

test("rejects the 0.0.0.0 bind host when the tab is localhost", () => {
  assert.equal(
    sameOriginContinuePath(
      "http://0.0.0.0:3000/start?intent=creator",
      "/start?intent=creator",
      "http://localhost:3000",
    ),
    "/start?intent=creator",
  );
});

test("allows 0.0.0.0 when that is the tab origin", () => {
  assert.equal(
    sameOriginContinuePath(
      "http://0.0.0.0:3000/work/studio",
      "/start",
      "http://0.0.0.0:3000",
    ),
    "/work/studio",
  );
});

test("falls back when url is missing", () => {
  assert.equal(sameOriginContinuePath(null, "/start?intent=creator"), "/start?intent=creator");
});
