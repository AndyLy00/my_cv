import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { ArrowLeft, Check, EyeOff, LogOut, Mail, MailOpen, Trash2 } from "lucide-react";
import { getDictionary, getLocale, type Dictionary } from "@/lib/i18n/dictionaries";
import { adminEnabled, isAdmin } from "@/lib/auth";
import { adminSnapshot } from "@/lib/db";
import { projects } from "@/lib/content";
import { adminGuestbook, adminLogout, adminMessage } from "@/lib/actions";
import { AdminLogin } from "@/components/admin-login";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

export default async function AdminPage() {
  const lang = await getLocale();
  const dict = await getDictionary(lang);
  return (
    <main id="main" className="container-x relative z-10 min-h-dvh pt-32 pb-20">
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-4xl font-semibold tracking-tight">
          <span className="accent">{dict.admin.title}</span>
        </h1>
        <Link href={`/${lang}`} className="btn btn-ghost !py-2">
          <ArrowLeft className="size-4" /> {dict.admin.back}
        </Link>
      </div>
      <Suspense fallback={<div className="card h-64 animate-pulse" />}>
        <AdminContent dict={dict} lang={lang} />
      </Suspense>
    </main>
  );
}

async function AdminContent({ dict, lang }: { dict: Dictionary; lang: string }) {
  await connection();
  const a = dict.admin;
  if (!adminEnabled()) return <p className="card p-8 text-center text-muted">{a.disabled}</p>;
  if (!(await isAdmin())) return <AdminLogin labels={{ login: a.login, password: a.password, wrong: a.wrong }} />;

  const data = await adminSnapshot();
  const unread = data.messages.filter((m) => !m.is_read).length;
  const maxDay = Math.max(1, ...data.days.map((d) => d.count));
  const maxLike = Math.max(1, ...Object.values(data.likes));
  const fmt = new Intl.DateTimeFormat(lang, { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" });
  const date = (iso: string) => fmt.format(new Date(iso));

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <form action={adminLogout}>
          <button className="btn btn-ghost !py-2"><LogOut className="size-4" /> {a.logout}</button>
        </form>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Stat label={a.totalViews} value={data.totalViews} />
        <Stat label={a.messages} value={data.messages.length} note={`${unread} ${a.unread}`} />
        <Stat label={a.guestbook} value={data.guestbook.length} note={`${data.guestbook.filter((g) => !g.approved).length} ${a.pending.toLowerCase()}`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card p-6">
          <h2 className="font-semibold">{a.views}</h2>
          <div className="mt-6 flex h-40 items-end gap-1.5">
            {data.days.map((d) => (
              <div key={d.day} className="group relative flex-1" style={{ height: `${Math.max(2, (d.count / maxDay) * 100)}%` }}>
                <div className={`h-full rounded-t-md transition ${d.count ? "bg-gradient-to-t from-brand to-brand-2 opacity-80 group-hover:opacity-100" : "bg-line"}`} />
                <span className="absolute -top-6 left-1/2 hidden -translate-x-1/2 rounded bg-ink px-1.5 text-[10px] text-bg group-hover:block">{d.count}</span>
                <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 font-mono text-[9px] text-muted">{d.day.slice(8)}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="card p-6">
          <h2 className="font-semibold">{a.likes}</h2>
          <ul className="mt-4 space-y-2.5">
            {projects.map((p) => {
              const n = data.likes[p.slug] ?? 0;
              return (
                <li key={p.slug} className="grid grid-cols-[9rem_1fr_2rem] items-center gap-3 text-sm">
                  <span className="truncate">{dict.projects.items[p.slug].title}</span>
                  <span className="h-2 overflow-hidden rounded-full bg-bg-2">
                    <span className="block h-full rounded-full" style={{ width: `${(n / maxLike) * 100}%`, background: p.accent }} />
                  </span>
                  <span className="text-right font-mono tabular-nums">{n}</span>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <section className="card p-6">
        <h2 className="font-semibold">{a.messages}</h2>
        {data.messages.length === 0 && <p className="mt-4 text-sm text-muted">{a.noMessages}</p>}
        <ul className="mt-4 divide-y divide-line">
          {data.messages.map((m) => (
            <li key={m.id} className={`grid gap-2 py-4 ${m.is_read ? "opacity-60" : ""}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">
                  {!m.is_read && <span className="mr-2 inline-block size-2 rounded-full bg-brand" />}
                  {m.name} · <a href={`mailto:${m.email}?subject=${encodeURIComponent("Re: " + (m.subject || "your message"))}`} className="text-brand hover:underline">{m.email}</a>
                </p>
                <span className="font-mono text-xs text-muted">{date(m.created_at)}</span>
              </div>
              {m.subject && <p className="text-sm font-semibold">{m.subject}</p>}
              <p className="whitespace-pre-wrap text-sm text-muted">{m.body}</p>
              <form action={adminMessage} className="flex gap-2">
                <input type="hidden" name="id" value={m.id} />
                <button name="op" value={m.is_read ? "unread" : "read"} className="chip hover:text-ink">
                  {m.is_read ? <Mail className="size-3.5" /> : <MailOpen className="size-3.5" />} {m.is_read ? a.markUnread : a.markRead}
                </button>
                <button name="op" value="delete" className="chip hover:text-rose-500"><Trash2 className="size-3.5" /> {a.delete}</button>
              </form>
            </li>
          ))}
        </ul>
      </section>

      <section className="card p-6">
        <h2 className="font-semibold">{a.guestbook}</h2>
        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          {data.guestbook.map((g) => (
            <li key={g.id} className={`rounded-2xl border p-4 ${g.approved ? "border-line" : "border-amber-400/50 bg-amber-400/5"}`}>
              <p className="text-sm">
                {g.emoji} <b>{g.name}</b> {g.role && <span className="text-muted">· {g.role}</span>}
                {!g.approved && <span className="ml-2 rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-semibold text-amber-600">{a.pending}</span>}
              </p>
              <p className="mt-2 text-sm text-muted">{g.message}</p>
              <form action={adminGuestbook} className="mt-3 flex gap-2">
                <input type="hidden" name="id" value={g.id} />
                {g.approved ? (
                  <button name="op" value="hide" className="chip hover:text-ink"><EyeOff className="size-3.5" /> {a.hide}</button>
                ) : (
                  <button name="op" value="approve" className="chip hover:text-emerald-600"><Check className="size-3.5" /> {a.approve}</button>
                )}
                <button name="op" value="delete" className="chip hover:text-rose-500"><Trash2 className="size-3.5" /> {a.delete}</button>
              </form>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Stat({ label, value, note }: { label: string; value: number; note?: string }) {
  return (
    <div className="card p-6">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 text-4xl font-semibold tabular-nums">{value}</p>
      {note && <p className="mt-1 text-xs text-muted">{note}</p>}
    </div>
  );
}
