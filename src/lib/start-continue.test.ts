import assert from "node:assert/strict";
import { test } from "node:test";
import { startContinue } from "./start-continue.ts";

test("waits until auth and workspace hydrate", () => {
  assert.deepEqual(
    startContinue({
      ready: false,
      hasIdentity: false,
      role: "anonymous",
      intent: "creator",
      next: null,
    }),
    { type: "wait" },
  );
});

test("logged-out start keeps creator intent on login", () => {
  assert.deepEqual(
    startContinue({
      ready: true,
      hasIdentity: false,
      role: "anonymous",
      intent: "creator",
      next: null,
    }),
    { type: "login", href: "/login?intent=creator" },
  );
});

test("creator intent attaches a studio instead of bouncing to login", () => {
  assert.deepEqual(
    startContinue({
      ready: true,
      hasIdentity: true,
      role: "anonymous",
      intent: "creator",
      next: null,
    }),
    { type: "attach", role: "creator" },
  );
});

test("existing creator goes to the studio", () => {
  assert.deepEqual(
    startContinue({
      ready: true,
      hasIdentity: true,
      role: "creator",
      intent: "creator",
      next: null,
    }),
    { type: "go", href: "/work/studio" },
  );
});

test("no intent still shows the picker", () => {
  assert.deepEqual(
    startContinue({
      ready: true,
      hasIdentity: true,
      role: "anonymous",
      intent: null,
      next: null,
    }),
    { type: "pick" },
  );
});
