import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import {
  clearOtpAttempts,
  cookieValue,
  formatPhone,
  makeOtpChallenge,
  normalizePhone,
  OTP_TTL_MS,
  otpAttemptsExceeded,
  recordOtpFailure,
  resetOtpThrottle,
  throttlePhone,
  verifyOtpChallenge,
} from "./whatsapp-otp.ts";

before(() => {
  process.env.AUTH_SECRET = "test-secret-for-otp";
  resetOtpThrottle();
});

after(() => {
  resetOtpThrottle();
});

test("normalizePhone accepts Malaysian mobiles", () => {
  assert.equal(normalizePhone("012-345 6789"), "60123456789");
  assert.equal(normalizePhone("+60 12-345 6789"), "60123456789");
  assert.equal(normalizePhone("60123456789"), "60123456789");
  assert.equal(normalizePhone("123456789"), "60123456789");
  assert.equal(normalizePhone("011-2345 6789"), "601123456789");
});

test("normalizePhone rejects junk", () => {
  assert.equal(normalizePhone(""), null);
  assert.equal(normalizePhone("123"), null);
  assert.equal(normalizePhone("+1 555 123 4567"), null);
});

test("formatPhone is readable", () => {
  assert.equal(formatPhone("60123456789"), "+60 12-345 6789");
  assert.equal(formatPhone("601123456789"), "+60 112-345 6789");
});

test("otp challenge verifies, then expires", () => {
  const phone = "60123456789";
  const code = "123456";
  const now = 1_700_000_000_000;
  const cookie = makeOtpChallenge(phone, code, now);
  assert.equal(verifyOtpChallenge(cookie, phone, code, now + 1000), true);
  assert.equal(verifyOtpChallenge(cookie, phone, "000000", now + 1000), false);
  assert.equal(verifyOtpChallenge(cookie, "60987654321", code, now + 1000), false);
  assert.equal(
    verifyOtpChallenge(cookie, phone, code, now + OTP_TTL_MS + 1),
    false,
  );
});

test("cookieValue reads a named cookie", () => {
  const header = "a=1; fxgen.wa.otp=60123456789.1.abc; other=z";
  assert.equal(cookieValue(header, "fxgen.wa.otp"), "60123456789.1.abc");
  assert.equal(cookieValue(null, "fxgen.wa.otp"), undefined);
});

test("throttlePhone caps three sends per 10 minutes", () => {
  resetOtpThrottle();
  const phone = "60111111111";
  const t0 = 5_000_000;
  assert.equal(throttlePhone(phone, t0), false);
  assert.equal(throttlePhone(phone, t0 + 1000), false);
  assert.equal(throttlePhone(phone, t0 + 2000), false);
  assert.equal(throttlePhone(phone, t0 + 3000), true);
});

test("otp attempts lock after five failures", () => {
  const phone = "60999999999";
  clearOtpAttempts(phone);
  for (let i = 0; i < 5; i += 1) recordOtpFailure(phone);
  assert.equal(otpAttemptsExceeded(phone), true);
  clearOtpAttempts(phone);
  assert.equal(otpAttemptsExceeded(phone), false);
});
