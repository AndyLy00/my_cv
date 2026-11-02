export type MessageRow = {
  id: number;
  name: string;
  email: string;
  subject: string;
  body: string;
  is_read: boolean;
  /** ISO 8601, UTC */
  created_at: string;
};

export type GuestbookRow = {
  id: number;
  name: string;
  role: string;
  message: string;
  emoji: string;
  approved: boolean;
  /** ISO 8601, UTC */
  created_at: string;
};

export type NewMessage = { name: string; email: string; subject: string; body: string; ipHash: string };
export type NewGuestbookEntry = { name: string; role: string; message: string; emoji: string; ipHash: string };

/** Everything the app needs from storage. Implemented by Netlify Blobs and SQLite (local dev). */
export interface Store {
  countRecent(table: "messages" | "guestbook", ipHash: string, minutes: number): Promise<number>;
  insertMessage(m: NewMessage): Promise<void>;
  insertGuestbook(g: NewGuestbookEntry): Promise<void>;
  approvedGuestbook(limit: number): Promise<GuestbookRow[]>;
  likeCounts(): Promise<Record<string, number>>;
  likedBy(visitor: string): Promise<string[]>;
  toggleLike(project: string, visitor: string): Promise<{ liked: boolean; count: number }>;
  trackView(): Promise<void>;
  totalViews(): Promise<number>;
  /** Views per day (YYYY-MM-DD, UTC) for the last `days` days. */
  viewsSince(days: number): Promise<{ day: string; count: number }[]>;
  listMessages(limit: number): Promise<MessageRow[]>;
  listGuestbook(limit: number): Promise<GuestbookRow[]>;
  setMessageRead(id: number, read: boolean): Promise<void>;
  deleteMessage(id: number): Promise<void>;
  setGuestbookApproved(id: number, approved: boolean): Promise<void>;
  deleteGuestbook(id: number): Promise<void>;
}
