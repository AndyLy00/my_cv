import "server-only";
import type { Store } from "./types";

export type { GuestbookRow, MessageRow } from "./types";

/**
 * Storage entry point.
 * - On Netlify (including `netlify dev`) → Netlify Blobs.
 * - Locally otherwise → a SQLite file in ./data (zero setup).
 * Backends are imported lazily so production never loads `node:sqlite`.
 */
let storePromise: Promise<Store> | undefined;

export function getStore(): Promise<Store> {
  storePromise ??= onNetlify()
    ? import("./blobs").then((m) => m.blobStore)
    : import("./sqlite").then((m) => m.sqliteStore);
  return storePromise;
}

function onNetlify() {
  return Boolean((globalThis as { Netlify?: unknown }).Netlify ?? process.env.NETLIFY_BLOBS_CONTEXT);
}

/** Everything the admin dashboard shows, in one call. */
export async function adminSnapshot() {
  const store = await getStore();
  const [messages, guestbook, recent, likes, totalViews] = await Promise.all([
    store.listMessages(100),
    store.listGuestbook(100),
    store.viewsSince(14),
    store.likeCounts(),
    store.totalViews(),
  ]);
  // Always 14 slots (oldest → today, UTC), zero-filled.
  const counts = new Map(recent.map((r) => [r.day, r.count]));
  const now = Date.now();
  const days = Array.from({ length: 14 }, (_, i) => {
    const day = new Date(now - (13 - i) * 86_400_000).toISOString().slice(0, 10);
    return { day, count: counts.get(day) ?? 0 };
  });
  return { messages, guestbook, days, likes, totalViews };
}
