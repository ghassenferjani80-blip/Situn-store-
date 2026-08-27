import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import type { User } from "../drizzle/schema";
import { getUserByEmail, getUserById, insertLocalUser } from "./db";
import { ENV } from "./_core/env";

export const SITUN_SESSION_COOKIE = "situn-session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

function secretKey() {
  if (!ENV.cookieSecret) throw new Error("JWT_SECRET is not configured");
  return new TextEncoder().encode(ENV.cookieSecret);
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, encoded: string) {
  const [salt, expectedHex] = encoded.split(":");
  if (!salt || !expectedHex) return false;
  const actual = scryptSync(password, salt, 64);
  const expected = Buffer.from(expectedHex, "hex");
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export async function createLocalSession(user: User) {
  return new SignJWT({ typ: "situn", userId: user.id, email: user.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(user.id))
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(secretKey());
}

export async function getLocalUserFromToken(token?: string) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    if (payload.typ !== "situn" || typeof payload.userId !== "number") return null;
    const user = await getUserById(payload.userId);
    return user?.loginMethod === "situn" ? user : null;
  } catch {
    return null;
  }
}

export async function registerLocalUser(input: { name: string; email: string; password: string }) {
  const email = normalizeEmail(input.email);
  const existing = await getUserByEmail(email);
  if (existing) throw new Error("EMAIL_ALREADY_REGISTERED");
  const user = await insertLocalUser({
    openId: `situn:${randomBytes(18).toString("hex")}`,
    name: input.name.trim(),
    email,
    passwordHash: hashPassword(input.password),
    loginMethod: "situn",
    lastSignedIn: new Date(),
  });
  return user;
}

export async function authenticateLocalUser(emailInput: string, password: string) {
  const user = await getUserByEmail(normalizeEmail(emailInput));
  if (!user?.passwordHash || user.loginMethod !== "situn" || !verifyPassword(password, user.passwordHash)) return null;
  return user;
}
