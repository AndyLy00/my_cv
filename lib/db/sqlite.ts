import "server-only";
import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import path from "node:path";
import type { GuestbookRow, MessageRow, Store } from "./types";

/**
 * Local-development fallback: a single SQLite file (Node's built-in `node:sqlite`).
 * Only loaded outside Netlify — see lib/db/index.ts.
 */
const DB_PATH = process.env.DATABASE_PATH ?? path.join(process.cwd(), "data", "cv.db");

const globalForDb = globalThis as unknown as { __cvDb?: DatabaseSync };

function open() {
  mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const db = new DatabaseSync(DB_PATH);
  db.exec(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT NOT NULL DEFAULT '',
      body TEXT NOT NULL,
      ip_hash TEXT NOT NULL,
      is_read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS guestbook (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT '',
      message TEXT NOT NULL,
      emoji TEXT NOT NULL DEFAULT '✨',
      approved INTEGER NOT NULL DEFAULT 0,
      ip_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS likes (
      project TEXT NOT NULL,
      visitor TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (project, visitor)
    );
    CREATE TABLE IF NOT EXISTS views (
      day TEXT PRIMARY KEY,
      count INTEGER NOT NULL DEFAULT 0
    );
  `);
  return db;
}

const db = globalForDb.__cvDb ?? open();
if (process.env.NODE_ENV !== "production") globalForDb.__cvDb = db;

type Row = Record<string, unknown>;
// SQLite stores "YYYY-MM-DD HH:MM:SS" in UTC.
const iso = (v: unknown) => new Date(String(v).replace(" ", "T") + "Z").toISOString();
const toMessage = (r: Row): MessageRow => ({
  id: Number(r.id),
  name: String(r.name),
  email: String(r.email),
  subject: String(r.subject),
  body: String(r.body),
  is_read: Boolean(r.is_read),
  created_at: iso(r.created_at),
});
const toGuestbook = (r: Row): GuestbookRow => ({
  id: Number(r.id),
  name: String(r.name),
  role: String(r.role),
  message: String(r.message),
  emoji: String(r.emoji),
  approved: Boolean(r.approved),
  created_at: iso(r.created_at),
});

export const sqliteStore: Store = {
  async countRecent(table, ipHash, minutes) {
    const row = db
      .prepare(`SELECT COUNT(*) AS n FROM ${table === "messages" ? "messages" : "guestbook"} WHERE ip_hash = ? AND created_at > datetime('now', ?)`)
      .get(ipHash, `-${minutes} minutes`) as { n: number };
    return row.n;
  },
  async insertMessage(m) {
    db.prepare(`INSERT INTO messages (name, email, subject, body, ip_hash) VALUES (?, ?, ?, ?, ?)`).run(m.name, m.email, m.subject, m.body, m.ipHash);
  },
  async insertGuestbook(g) {
    db.prepare(`INSERT INTO guestbook (name, role, message, emoji, ip_hash) VALUES (?, ?, ?, ?, ?)`).run(g.name, g.role, g.message, g.emoji, g.ipHash);
  },
  async approvedGuestbook(limit) {
    return (db.prepare(`SELECT * FROM guestbook WHERE approved = 1 ORDER BY id DESC LIMIT ?`).all(limit) as Row[]).map(toGuestbook);
  },
  async likeCounts() {
    const rows = db.prepare(`SELECT project, COUNT(*) AS n FROM likes GROUP BY project`).all() as { project: string; n: number }[];
    return Object.fromEntries(rows.map((r) => [r.project, r.n]));
  },
  async likedBy(visitor) {
    return (db.prepare(`SELECT project FROM likes WHERE visitor = ?`).all(visitor) as { project: string }[]).map((r) => r.project);
  },
  async toggleLike(project, visitor) {
    const removed = db.prepare(`DELETE FROM likes WHERE project = ? AND visitor = ?`).run(project, visitor);
    const liked = removed.changes === 0;
    if (liked) db.prepare(`INSERT OR IGNORE INTO likes (project, visitor) VALUES (?, ?)`).run(project, visitor);
    const { n } = db.prepare(`SELECT COUNT(*) AS n FROM likes WHERE project = ?`).get(project) as { n: number };
    return { liked, count: n };
  },
  async trackView() {
    db.prepare(`INSERT INTO views (day, count) VALUES (date('now'), 1) ON CONFLICT(day) DO UPDATE SET count = count + 1`).run();
  },
  async totalViews() {
    return (db.prepare(`SELECT COALESCE(SUM(count), 0) AS n FROM views`).get() as { n: number }).n;
  },
  async viewsSince(days) {
    return db.prepare(`SELECT day, count FROM views WHERE day > date('now', ?)`).all(`-${days} days`) as { day: string; count: number }[];
  },
  async listMessages(limit) {
    return (db.prepare(`SELECT * FROM messages ORDER BY id DESC LIMIT ?`).all(limit) as Row[]).map(toMessage);
  },
  async listGuestbook(limit) {
    return (db.prepare(`SELECT * FROM guestbook ORDER BY approved ASC, id DESC LIMIT ?`).all(limit) as Row[]).map(toGuestbook);
  },
  async setMessageRead(id, read) {
    db.prepare(`UPDATE messages SET is_read = ? WHERE id = ?`).run(read ? 1 : 0, id);
  },
  async deleteMessage(id) {
    db.prepare(`DELETE FROM messages WHERE id = ?`).run(id);
  },
  async setGuestbookApproved(id, approved) {
    db.prepare(`UPDATE guestbook SET approved = ? WHERE id = ?`).run(approved ? 1 : 0, id);
  },
  async deleteGuestbook(id) {
    db.prepare(`DELETE FROM guestbook WHERE id = ?`).run(id);
  },
};
