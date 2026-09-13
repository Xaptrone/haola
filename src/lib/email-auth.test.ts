import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, test } from "node:test";
import {
  authenticateEmailUser,
  createEmailUser,
  hashPassword,
  nameFromEmail,
  normalizeEmail,
  validatePassword,
  verifyPassword,
} from "./email-auth.ts";

const dir = mkdtempSync(join(tmpdir(), "fxgen-users-"));

before(() => {
  process.env.FXGEN_USERS_PATH = join(dir, "users.json");
});

after(() => {
  rmSync(dir, { recursive: true, force: true });
});

test("normalizeEmail accepts a normal address", () => {
  assert.equal(normalizeEmail("  Aisha@Brand.my "), "aisha@brand.my");
});

test("normalizeEmail rejects junk", () => {
  assert.equal(normalizeEmail(""), null);
  assert.equal(normalizeEmail("not-an-email"), null);
  assert.equal(normalizeEmail("a@b"), null);
});

test("nameFromEmail uses the local part", () => {
  assert.equal(nameFromEmail("aisha.tan@brand.my"), "aisha tan");
});

test("password hashing round-trips", () => {
  const stored = hashPassword("hunter2!!");
  assert.equal(verifyPassword("hunter2!!", stored), true);
  assert.equal(verifyPassword("wrong-pass", stored), false);
});

test("validatePassword enforces length", () => {
  assert.equal(validatePassword("short"), "Use at least 8 characters.");
  assert.equal(validatePassword("longenough"), null);
});

test("createEmailUser then authenticate", () => {
  const created = createEmailUser({
    email: "owner@brand.my",
    password: "secret123",
    name: "Aisha",
  });
  assert.equal(created.ok, true);
  if (!created.ok) return;
  assert.equal(created.user.email, "owner@brand.my");
  assert.equal(created.user.id, "email:owner@brand.my");
  const user = authenticateEmailUser("owner@brand.my", "secret123");
  assert.equal(user?.name, "Aisha");
  assert.equal(authenticateEmailUser("owner@brand.my", "nope"), null);
});

test("createEmailUser rejects duplicates", () => {
  const again = createEmailUser({
    email: "owner@brand.my",
    password: "secret123",
  });
  assert.equal(again.ok, false);
  if (again.ok) return;
  assert.equal(again.status, 409);
});
