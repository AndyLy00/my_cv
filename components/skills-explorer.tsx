"use client";

import { useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { skills, type SkillGroup } from "@/lib/content";
import type { Dictionary } from "@/lib/i18n/en";

type Filter = SkillGroup | "all";

export function SkillsExplorer({ dict }: { dict: Dictionary["skills"] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const visible = skills.filter((s) => filter === "all" || s.group === filter);
  const filters = Object.keys(dict.groups) as Filter[];

  return (
    <LayoutGroup>
      <div className="flex flex-wrap gap-2" role="tablist" aria-label={dict.title}>
        {filters.map((f) => (
          <button
            key={f}
            role="tab"
            aria-selected={filter === f}
            onClick={() => setFilter(f)}
            className={`relative rounded-full px-4 py-2 text-sm font-medium transition-colors ${filter === f ? "text-white" : "text-muted hover:text-ink"}`}
          >
            {filter === f && <motion.span layoutId="skill-tab" className="absolute inset-0 -z-10 rounded-full bg-brand" transition={{ type: "spring", bounce: 0.2, duration: 0.5 }} />}
            {dict.groups[f]}
          </button>
        ))}
      </div>
      <p className="mt-4 text-sm text-muted">{dict.hint}</p>

      <motion.ul layout className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {visible.map((s, i) => (
            <motion.li
              layout
              key={s.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1, transition: { delay: i * 0.02 } }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ y: -3 }}
              className="card group relative overflow-hidden p-4"
            >
              <div
                aria-hidden
                className="absolute -right-8 -top-8 size-24 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-60"
                style={{ background: s.color }}
              />
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2.5 font-medium">
                  <span className="size-2.5 rounded-full ring-4 ring-[color-mix(in_oklab,currentColor_15%,transparent)]" style={{ background: s.color, color: s.color }} />
                  {s.name}
                </span>
                <span className="font-mono text-xs text-muted tabular-nums">{s.level}%</span>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-bg-2">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${s.color}, var(--brand))` }}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${s.level}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.1 + i * 0.03 }}
                />
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </LayoutGroup>
  );
}
