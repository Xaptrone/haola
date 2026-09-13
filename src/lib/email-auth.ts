import {
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import {
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";

export type StoredEmailUser = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HASH_BYTES = 64;

export function usersFilePath() {
  return process.env.FXGEN_USERS_PATH || join(process.cwd(), ".data", "users.json");
}

export function normalizeEmail(raw: string): string | null {
  const email = raw.trim().toLowerCase();
  if (!email || email.length > 254 || !EMAIL_RE.test(email)) return null;
  return email;
}

export function nameFromEmail(email: string) {
  const local = email.split("@")[0] ?? "";
  const cleaned = local.replace(/[._+]+/g, " ").trim();
  return cleaned || email;
}

export function emailUserId(email: string) {
  return `email:${email}`;
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, HASH_BYTES).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const sep = stored.indexOf(":");
  if (sep <= 0) return false;
  const salt = stored.slice(0, sep);
  const hash = stored.slice(sep + 1);
  if (!salt || !hash) return false;
  try {
    const next = scryptSync(password, salt, HASH_BYTES);
    const prev = Buffer.from(hash, "hex");
    if (prev.length !== next.length) return false;
    return timingSafeEqual(prev, next);
  } catch {
    return false;
  }
}

export function validatePassword(password: string): string | null {
  if (password.length < 8) return "Use at least 8 characters.";
  if (password.length > 200) return "Password is too long.";
  return null;
}

function readUsers(path = usersFilePath()): StoredEmailUser[] {
  try {
    const raw = readFileSync(path, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isStoredUser);
  } catch {
    return [];
  }
}

function isStoredUser(value: unknown): value is StoredEmailUser {
  if (!value || typeof value !== "object") return false;
  const user = value as StoredEmailUser;
  return (
    typeof user.id === "string" &&
    typeof user.email === "string" &&
    typeof user.name === "string" &&
    typeof user.passwordHash === "string" &&
    typeof user.createdAt === "string"
  );
}

function writeUsers(users: StoredEmailUser[], path = usersFilePath()) {
  mkdirSync(dirname(path), { recursive: true });
  const tmp = `${path}.${process.pid}.tmp`;
  writeFileSync(tmp, `${JSON.stringify(users, null, 2)}\n`, "utf8");
  renameSync(tmp, path);
}

export function findEmailUser(email: string) {
  const normalized = normalizeEmail(email);
  if (!normalized) return null;
  return readUsers().find((user) => user.email === normalized) ?? null;
}

export function createEmailUser(input: {
  email: string;
  password: string;
  name?: string;
}):
  | { ok: true; user: { id: string; email: string; name: string } }
  | { ok: false; error: string; status: number } {
  const email = normalizeEmail(input.email);
  if (!email) {
    return { ok: false, error: "Enter a valid email.", status: 400 };
  }
  const passwordError = validatePassword(input.password);
  if (passwordError) {
    return { ok: false, error: passwordError, status: 400 };
  }
  const users = readUsers();
  if (users.some((user) => user.email === email)) {
    return { ok: false, error: "That email already has an account. Log in.", status: 409 };
  }
  const name = input.name?.trim() || nameFromEmail(email);
  const user: StoredEmailUser = {
    id: emailUserId(email),
    email,
    name,
    passwordHash: hashPassword(input.password),
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  writeUsers(users);
  return { ok: true, user: { id: user.id, email: user.email, name: user.name } };
}

export function authenticateEmailUser(email: string, password: string) {
  const user = findEmailUser(email);
  if (!user || !verifyPassword(password, user.passwordHash)) return null;
  return { id: user.id, email: user.email, name: user.name };
}
