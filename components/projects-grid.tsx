"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { ArrowUpRight, CloudOff, Lock } from "lucide-react";
import { projects, type ProjectKind } from "@/lib/content";
import type { Dictionary } from "@/lib/i18n/en";
import type { Locale } from "@/lib/i18n/config";
import { BrowserFrame } from "./browser-frame";
import { GithubIcon } from "./icons";
import { LikeButton } from "./like-button";

type Filter = ProjectKind | "all";

export function ProjectsGrid({
  lang,
  dict,
  likes,
  liked,
}: {
  lang: Locale;
  dict: Dictionary["projects"];
  likes?: Record<string, number>;
  liked?: string[];
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const filters = (Object.keys(dict.filters) as Filter[]).filter(
    (f) => f === "all" || projects.some((p) => p.kinds.includes(f as ProjectKind)),
  );
  const visible = projects.filter((p) => filter === "all" || p.kinds.includes(filter as ProjectKind));

  return (
    <LayoutGroup>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2" role="tablist">
          {filters.map((f) => (
            <button
              key={f}
              role="tab"
              aria-selected={filter === f}
              onClick={() => setFilter(f)}
              className={`relative rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                filter === f ? "border-transparent text-bg" : "border-line text-muted hover:text-ink"
              }`}
            >
              {filter === f && <motion.span layoutId="proj-tab" className="absolute inset-0 -z-10 rounded-full bg-ink" transition={{ type: "spring", bounce: 0.2, duration: 0.5 }} />}
              {dict.filters[f]}
            </button>
          ))}
        </div>
        <p className="hidden font-mono text-xs text-muted md:block">↕ {dict.hoverHint}</p>
      </div>

      <motion.ul layout className="mt-10 grid gap-6 md:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {visible.map((p, i) => {
            const t = dict.items[p.slug];
            return (
              <motion.li
                layout
                key={p.slug}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0, transition: { delay: Math.min(i, 6) * 0.05, duration: 0.5 } }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={p.featured && filter === "all" && i === 0 ? "md:col-span-2" : ""}
              >
                <article className="card group relative flex h-full flex-col overflow-hidden p-3 transition-shadow duration-500 hover:shadow-[0_30px_80px_-40px_var(--glow)]">
                  <div
                    aria-hidden
                    className="absolute inset-x-10 -top-20 h-40 rounded-full opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-50"
                    style={{ background: p.accent }}
                  />
                  <Link href={`/${lang}/projects/${p.slug}`} className="relative block" aria-label={`${t.title} — ${dict.caseStudy}`}>
                    <BrowserFrame project={p} height={p.featured && filter === "all" && i === 0 ? 340 : 240} priority={i < 2} />
                  </Link>
                  <div className="relative flex flex-1 flex-col p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-mono text-[11px] uppercase tracking-widest text-muted">
                          {p.year} · {p.kinds.map((k) => dict.filters[k]).join(" / ")}
                        </p>
                        <h3 className="mt-1 text-xl font-semibold tracking-tight">
                          <Link href={`/${lang}/projects/${p.slug}`} className="hover:text-brand">{t.title}</Link>
                        </h3>
                        <p className="mt-1 text-sm text-muted">{t.tagline}</p>
                      </div>
                      <LikeButton
                        slug={p.slug}
                        label={dict.like}
                        initial={likes ? { count: likes[p.slug] ?? 0, liked: liked?.includes(p.slug) ?? false } : undefined}
                      />
                    </div>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {p.stack.slice(0, 5).map((s) => (
                        <span key={s} className="chip">{s}</span>
                      ))}
                    </div>
                    <div className="mt-auto flex flex-wrap items-center gap-2 pt-5">
                      <Link href={`/${lang}/projects/${p.slug}`} className="btn btn-primary !px-4 !py-2 group/btn">
                        {dict.caseStudy}
                        <ArrowUpRight className="size-4 transition-transform group-hover/btn:rotate-45" />
                      </Link>
                      {p.live && !p.liveDown && (
                        <a href={p.live} target="_blank" rel="noreferrer" className="btn btn-ghost !px-4 !py-2">{dict.live}</a>
                      )}
                      {p.liveDown && (
                        <span className="inline-flex items-center gap-1 px-2 text-xs text-muted"><CloudOff className="size-3.5" />{dict.offline}</span>
                      )}
                      {p.github ? (
                        <a href={p.github} target="_blank" rel="noreferrer" className="ml-auto grid size-9 place-items-center rounded-full text-muted transition hover:bg-bg-2 hover:text-ink" aria-label={`${t.title} — ${dict.code}`}>
                          <GithubIcon className="size-4" />
                        </a>
                      ) : (
                        <span className="ml-auto inline-flex items-center gap-1 text-xs text-muted"><Lock className="size-3.5" />{dict.privateRepo}</span>
                      )}
                    </div>
                  </div>
                </article>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </motion.ul>
    </LayoutGroup>
  );
}
