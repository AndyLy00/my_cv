import "server-only";
import { createHmac, timingSafeEqual, createHash } from "node:crypto";
import { cookies, headers } from "next/headers";

const COOKIE = "cv_admin";
const MAX_AGE = 60 * 60 * 8; // 8h

const secret = () => process.env.SESSION_SECRET ?? process.env.ADMIN_PASSWORD ?? "";

export const adminEnabled = () => Boolean(process.env.ADMIN_PASSWORD);

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export function checkPassword(input: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  // Compare hashes so lengths always match.
  const h = (s: string) => createHash("sha256").update(s).digest("hex");
  return safeEqual(h(input), h(expected));
}

export async function createSession() {
  const expires = Date.now() + MAX_AGE * 1000;
  const payload = `admin.${expires}`;
  (await cookies()).set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin() {
  if (!adminEnabled()) return false;
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return false;
  const i = raw.lastIndexOf(".");
  const payload = raw.slice(0, i);
  const sig = raw.slice(i + 1);
  if (!safeEqual(sig, sign(payload))) return false;
  const expires = Number(payload.split(".")[1]);
  return Number.isFinite(expires) && expires > Date.now();
}

/** Anonymised requester fingerprint used for rate limiting. Never stores the raw IP. */
export async function requesterHash() {
  const h = await headers();
  // Netlify sets x-nf-client-connection-ip; other hosts use x-forwarded-for / x-real-ip.
  const ip =
    h.get("x-nf-client-connection-ip") || h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
  return createHash("sha256").update(`${ip}|${secret() || "cv"}`).digest("hex").slice(0, 32);
}
