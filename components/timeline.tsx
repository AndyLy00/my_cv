"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring } from "motion/react";
import { Briefcase, GraduationCap, MapPin } from "lucide-react";

export type TimelineItem = {
  id: string;
  company: string;
  role: string;
  period: string;
  location: string;
  bullets: string[];
  stack: string[];
  kind: "work" | "education";
  current: boolean;
};

export function Timeline({ items }: { items: TimelineItem[] }) {
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 60%"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  return (
    <ol ref={ref} className="relative mt-14 space-y-10 pl-10 sm:pl-14">
      <div aria-hidden className="absolute left-[15px] top-2 bottom-2 w-px bg-line sm:left-[23px]" />
      <motion.div
        aria-hidden
        style={{ scaleY }}
        className="absolute left-[14px] top-2 bottom-2 w-[3px] origin-top rounded-full bg-gradient-to-b from-brand via-brand-2 to-brand-3 sm:left-[22px]"
      />
      {items.map((item, i) => {
        const Icon = item.kind === "education" ? GraduationCap : Briefcase;
        return (
          <motion.li
            key={item.id}
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: i * 0.05 }}
            className="relative"
          >
            <span className="absolute -left-10 top-1 grid size-8 place-items-center rounded-full border border-line bg-surface text-brand shadow-sm sm:-left-14 sm:size-12">
              <Icon className="size-4 sm:size-5" />
              {item.current && <span className="absolute -right-0.5 -top-0.5 size-3 rounded-full border-2 border-surface bg-emerald-500" />}
            </span>
            <article className="card p-6 transition-shadow duration-500 hover:shadow-[0_20px_60px_-30px_var(--glow)] sm:p-7">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h3 className="text-lg font-semibold sm:text-xl">
                  {item.role} <span className="text-brand">· {item.company}</span>
                </h3>
                <span className="font-mono text-xs text-muted">{item.period}</span>
              </div>
              <p className="mt-1 inline-flex items-center gap-1 text-sm text-muted">
                <MapPin className="size-3.5" /> {item.location}
              </p>
              <ul className="mt-4 space-y-2 text-[15px] leading-relaxed text-muted">
                {item.bullets.map((b) => (
                  <li key={b} className="flex gap-2.5">
                    <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-brand" />
                    {b}
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {item.stack.map((s) => (
                  <span key={s} className="chip">{s}</span>
                ))}
              </div>
            </article>
          </motion.li>
        );
      })}
    </ol>
  );
}
