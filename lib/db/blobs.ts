import "server-only";
import { getStore as openBlobStore } from "@netlify/blobs";
import type { GuestbookRow, MessageRow, Store } from "./types";

/**
 * Netlify Blobs: site-wide key/value storage that persists across deploys, with no setup.
 *
 * Blobs has no queries or transactions and concurrent writes to one key are last-write-wins,
 * so each record gets its own key and relations are expressed as marker keys:
 *   messages/<id>                  a message
 *   guestbook/<id>                 a guestbook entry
 *   guestbook-approved/<id>        marker: the entry is public (the only source of `approved`)
 *   rate/<table>/<ipHash>/<id>     marker: one submission, for rate limiting
 *   likes/<project>/<visitor>      marker: one like
 *   views                          { "YYYY-MM-DD": count }, updated with conditional writes
 *
 * Ids are microsecond timestamps, so they sort chronologically and embed their creation time.
 */
const blobs = () => openBlobStore({ name: "cv", consistency: "strong" });

const newId = () => Date.now() * 1000 + Math.floor(Math.random() * 1000);
const idTime = (id: number) => id / 1000;
const today = () => new Date().toISOString().slice(0, 10);

type StoredMessage = Omit<MessageRow, "id">;
type StoredEntry = Omit<GuestbookRow, "id" | "approved">;
type ViewCounts = Record<string, number>;

async function keys(prefix: string) {
  const { blobs: found } = await blobs().list({ prefix });
  return found.map((b) => b.key);
}

/** Numeric ids under a prefix, newest first. */
async function idsNewestFirst(prefix: string) {
  const found = await keys(prefix);
  return found.map((k) => Number(k.slice(k.lastIndexOf("/") + 1))).sort((a, b) => b - a);
}

async function approvedIds() {
  return new Set(await idsNewestFirst("guestbook-approved/"));
}

async function readEntry(id: number, approved: boolean): Promise<GuestbookRow | null> {
  const entry = (await blobs().get(`guestbook/${id}`, { type: "json" })) as StoredEntry | null;
  return entry && { ...entry, id, approved };
}

async function readEntries(ids: number[], approved: Set<number>) {
  const rows = await Promise.all(ids.map((id) => readEntry(id, approved.has(id))));
  return rows.filter((r) => r !== null);
}

/** Visitor ids come from a cookie: encode them so they can't add path segments to the key. */
const likeKey = (project: string, visitor: string) => `likes/${project}/${encodeURIComponent(visitor)}`;

async function allLikes() {
  const found = await keys("likes/");
  return found.map((k) => {
    const [, project, visitor] = k.split("/");
    return { project, visitor: decodeURIComponent(visitor) };
  });
}

async function readViews() {
  return ((await blobs().get("views", { type: "json" })) as ViewCounts | null) ?? {};
}

export const blobStore: Store = {
  async countRecent(table, ipHash, minutes) {
    const prefix = `rate/${table}/${ipHash}/`;
    const cutoff = Date.now() - minutes * 60_000;
    const ids = await idsNewestFirst(prefix);
    const stale = ids.filter((id) => idTime(id) <= cutoff);
    await Promise.all(stale.map((id) => blobs().delete(prefix + id)));
    return ids.length - stale.length;
  },

  async insertMessage({ ipHash, ...m }) {
    const id = newId();
    const row: StoredMessage = { ...m, is_read: false, created_at: new Date().toISOString() };
    await blobs().setJSON(`messages/${id}`, row);
    await blobs().set(`rate/messages/${ipHash}/${id}`, "");
  },

  async insertGuestbook({ ipHash, ...g }) {
    const id = newId();
    const row: StoredEntry = { ...g, created_at: new Date().toISOString() };
    await blobs().setJSON(`guestbook/${id}`, row);
    await blobs().set(`rate/guestbook/${ipHash}/${id}`, "");
  },

  async approvedGuestbook(limit) {
    const approved = await approvedIds();
    const newest = [...approved].slice(0, limit);
    return readEntries(newest, approved);
  },

  async likeCounts() {
    const counts: Record<string, number> = {};
    for (const { project } of await allLikes()) counts[project] = (counts[project] ?? 0) + 1;
    return counts;
  },

  async likedBy(visitor) {
    return (await allLikes()).filter((l) => l.visitor === visitor).map((l) => l.project);
  },

  async toggleLike(project, visitor) {
    const key = likeKey(project, visitor);
    const liked = (await blobs().getMetadata(key)) === null;
    if (liked) await blobs().set(key, "");
    else await blobs().delete(key);
    const count = (await keys(`likes/${project}/`)).length;
    return { liked, count };
  },

  async trackView() {
    // Compare-and-swap, so simultaneous views don't overwrite each other's increment.
    for (let attempt = 0; attempt < 5; attempt++) {
      const current = await blobs().getWithMetadata("views", { type: "json" });
      const counts = (current?.data as ViewCounts | undefined) ?? {};
      const day = today();
      const next = { ...counts, [day]: (counts[day] ?? 0) + 1 };
      // No record → create-only. A record without an etag (local sandbox) can't be compared.
      const condition = !current ? { onlyIfNew: true as const } : current.etag ? { onlyIfMatch: current.etag } : {};
      const { modified } = await blobs().setJSON("views", next, condition);
      if (modified) return;
    }
  },

  async totalViews() {
    return Object.values(await readViews()).reduce((sum, n) => sum + n, 0);
  },

  async viewsSince(days) {
    const cutoff = new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);
    return Object.entries(await readViews())
      .filter(([day]) => day > cutoff)
      .map(([day, count]) => ({ day, count }));
  },

  async listMessages(limit) {
    const ids = (await idsNewestFirst("messages/")).slice(0, limit);
    const rows = await Promise.all(
      ids.map(async (id) => {
        const m = (await blobs().get(`messages/${id}`, { type: "json" })) as StoredMessage | null;
        return m && { ...m, id };
      }),
    );
    return rows.filter((r) => r !== null);
  },

  async listGuestbook(limit) {
    const [ids, approved] = await Promise.all([idsNewestFirst("guestbook/"), approvedIds()]);
    // Pending entries first, so moderation never scrolls out of view.
    const ordered = [...ids.filter((id) => !approved.has(id)), ...ids.filter((id) => approved.has(id))];
    return readEntries(ordered.slice(0, limit), approved);
  },

  async setMessageRead(id, read) {
    const key = `messages/${id}`;
    const m = (await blobs().get(key, { type: "json" })) as StoredMessage | null;
    if (m) await blobs().setJSON(key, { ...m, is_read: read });
  },

  async deleteMessage(id) {
    await blobs().delete(`messages/${id}`);
  },

  async setGuestbookApproved(id, approved) {
    const marker = `guestbook-approved/${id}`;
    if (approved) await blobs().set(marker, "");
    else await blobs().delete(marker);
  },

  async deleteGuestbook(id) {
    await blobs().delete(`guestbook-approved/${id}`);
    await blobs().delete(`guestbook/${id}`);
  },
};
