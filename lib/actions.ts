"use server";

import { cookies } from "next/headers";
import { refresh } from "next/cache";
import { randomUUID } from "node:crypto";
import { getStore } from "./db";
import { checkPassword, createSession, destroySession, isAdmin, requesterHash } from "./auth";
import { projects } from "./content";
import { alertNewMessage, alertNewNote } from "./email";
import type { Dictionary } from "./i18n/en";

export type FormState = {
  ok: boolean;
  error?: keyof Dictionary["errors"];
  /** echo of submitted values so the form keeps them on error */
  values?: Record<string, string>;
  /** bumps on each success so clients can react (confetti, reset) */
  stamp?: number;
};

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function sendMessage(_prev: FormState, fd: FormData): Promise<FormState> {
  const values = { name: str(fd, "name"), email: str(fd, "email"), subject: str(fd, "subject"), body: str(fd, "body") };
  // Honeypot: bots fill every field. Pretend success.
  if (str(fd, "website")) return { ok: true, stamp: Date.now() };

  if (!values.name || !values.email || !values.body) return { ok: false, error: "required", values };
  if (!EMAIL_RE.test(values.email)) return { ok: false, error: "email", values };
  if (values.name.length > 80 || values.subject.length > 140 || values.body.length > 4000 || values.email.length > 160)
    return { ok: false, error: "tooLong", values };

  try {
    const ipHash = await requesterHash();
    const store = await getStore();
    if ((await store.countRecent("messages", ipHash, 15)) >= 3) return { ok: false, error: "rateLimit", values };
    await store.insertMessage({ ...values, ipHash });
    await alertNewMessage(values);
    return { ok: true, stamp: Date.now() };
  } catch (e) {
    console.error("sendMessage failed", e);
    return { ok: false, error: "generic", values };
  }
}

const EMOJIS = ["✨", "💜", "🚀", "🌸", "👏", "☕", "🔥", "🌿"];

export async function signGuestbook(_prev: FormState, fd: FormData): Promise<FormState> {
  const values = { name: str(fd, "name"), role: str(fd, "role"), message: str(fd, "message"), emoji: str(fd, "emoji") };
  if (str(fd, "website")) return { ok: true, stamp: Date.now() };
  if (!values.name || !values.message) return { ok: false, error: "required", values };
  if (values.name.length > 60 || values.role.length > 80 || values.message.length > 280) return { ok: false, error: "tooLong", values };
  const emoji = EMOJIS.includes(values.emoji) ? values.emoji : "✨";

  try {
    const ipHash = await requesterHash();
    const store = await getStore();
    if ((await store.countRecent("guestbook", ipHash, 30)) >= 2) return { ok: false, error: "rateLimit", values };
    await store.insertGuestbook({ name: values.name, role: values.role, message: values.message, emoji, ipHash });
    await alertNewNote(values);
    return { ok: true, stamp: Date.now() };
  } catch (e) {
    console.error("signGuestbook failed", e);
    return { ok: false, error: "generic", values };
  }
}

async function visitorId() {
  const jar = await cookies();
  let id = jar.get("cv_vid")?.value;
  if (!id || id.length > 64) {
    id = randomUUID();
    jar.set("cv_vid", id, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 365 });
  }
  return id;
}

export async function toggleProjectLike(slug: string) {
  if (!projects.some((p) => p.slug === slug)) throw new Error("Unknown project");
  return (await getStore()).toggleLike(slug, await visitorId());
}

export async function recordView() {
  await (await getStore()).trackView();
}

// ---------- admin ----------

export async function adminLogin(_prev: FormState, fd: FormData): Promise<FormState> {
  // Small constant delay blunts brute forcing.
  await new Promise((r) => setTimeout(r, 400));
  if (!checkPassword(str(fd, "password"))) return { ok: false, error: "generic" };
  await createSession();
  refresh();
  return { ok: true };
}

export async function adminLogout() {
  await destroySession();
  refresh();
}

async function requireAdmin() {
  if (!(await isAdmin())) throw new Error("Unauthorized");
}

export async function adminMessage(fd: FormData) {
  await requireAdmin();
  const id = Number(fd.get("id"));
  const op = str(fd, "op");
  if (!Number.isInteger(id)) return;
  const store = await getStore();
  if (op === "delete") await store.deleteMessage(id);
  else await store.setMessageRead(id, op === "read");
  refresh();
}

export async function adminGuestbook(fd: FormData) {
  await requireAdmin();
  const id = Number(fd.get("id"));
  const op = str(fd, "op");
  if (!Number.isInteger(id)) return;
  const store = await getStore();
  if (op === "delete") await store.deleteGuestbook(id);
  else await store.setGuestbookApproved(id, op === "approve");
  refresh();
}
