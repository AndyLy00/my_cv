"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform, useReducedMotion } from "motion/react";
import { ArrowDown, ArrowUpRight, Download, MapPin, Plane } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/en";
import { profile, showRelocation } from "@/lib/content";
import { GithubIcon, LinkedinIcon } from "./icons";

const ease = [0.22, 1, 0.36, 1] as const;

function RoleTyper({ roles }: { roles: string[] }) {
  const [i, setI] = useState(0);
  // Start fully typed so the first paint (and no-JS visitors) see a real role.
  const [text, setText] = useState(roles[0]);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const full = roles[i % roles.length];
    const done = !deleting && text === full;
    const empty = deleting && text === "";
    const delay = done ? 1800 : empty ? 300 : deleting ? 35 : 70;
    const t = setTimeout(() => {
      if (done) setDeleting(true);
      else if (empty) {
        setDeleting(false);
        setI((v) => v + 1);
      } else setText(deleting ? full.slice(0, text.length - 1) : full.slice(0, text.length + 1));
    }, delay);
    return () => clearTimeout(t);
  }, [text, deleting, i, roles]);

  return (
    <span className="whitespace-nowrap">
      <span className="accent">{text || "​"}</span>
      <span className="caret ml-0.5 inline-block h-[0.9em] w-[3px] translate-y-[0.1em] rounded bg-brand" />
    </span>
  );
}

export function Magnetic({ children, strength = 0.35 }: { children: ReactNode; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useSpring(0, { stiffness: 200, damping: 15 });
  const y = useSpring(0, { stiffness: 200, damping: 15 });
  return (
    <motion.div
      ref={ref}
      style={{ x, y }}
      className="inline-block"
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse" || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        x.set((e.clientX - r.left - r.width / 2) * strength);
        y.set((e.clientY - r.top - r.height / 2) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

function Portrait() {
  const reduce = useReducedMotion();
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(my, [0, 1], [10, -10]), { stiffness: 150, damping: 18 });
  const rotateY = useSpring(useTransform(mx, [0, 1], [-12, 12]), { stiffness: 150, damping: 18 });
  const glareX = useTransform(mx, [0, 1], ["0%", "100%"]);
  const glareY = useTransform(my, [0, 1], ["0%", "100%"]);
  const glare = useMotionTemplate`radial-gradient(circle at ${glareX} ${glareY}, rgb(255 255 255 / 0.55), transparent 55%)`;

  const chips = [
    { label: "React", cls: "-left-6 top-10", d: 0 },
    { label: "Magento 2", cls: "-right-8 top-24", d: 1.2 },
    { label: "Next.js", cls: "-left-10 bottom-24", d: 2.1 },
    { label: "Vue", cls: "-right-4 bottom-10", d: 0.6 },
  ];

  return (
    <div className="relative mx-auto w-[min(78vw,380px)] [perspective:1200px]">
      <div aria-hidden className="animate-blob absolute -inset-6 bg-gradient-to-br from-brand via-brand-2 to-brand-3 opacity-40 blur-2xl" />
      <motion.div
        style={reduce ? undefined : { rotateX, rotateY, transformStyle: "preserve-3d" }}
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          mx.set((e.clientX - r.left) / r.width);
          my.set((e.clientY - r.top) / r.height);
        }}
        onPointerLeave={() => {
          mx.set(0.5);
          my.set(0.5);
        }}
        className="animate-blob relative aspect-[4/5] overflow-hidden border-4 border-surface shadow-2xl [animation-duration:22s]"
      >
        <Image
          src="/me/portrait.webp"
          alt="Andreia Sirețanu"
          fill
          priority
          sizes="(max-width: 768px) 78vw, 380px"
          className="object-cover"
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 mix-blend-soft-light"
          style={{ background: glare }}
        />
      </motion.div>

      {chips.map((c) => (
        <motion.span
          key={c.label}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.9 + c.d * 0.2, type: "spring", bounce: 0.5 }}
          className={`animate-float absolute ${c.cls} chip !bg-surface/90 !text-ink shadow-lg backdrop-blur`}
          style={{ animationDelay: `${c.d}s` }}
        >
          <span className="size-1.5 rounded-full bg-brand" />
          {c.label}
        </motion.span>
      ))}
    </div>
  );
}

export function Hero({ dict }: { dict: Dictionary["hero"] }) {
  const name = "Andreia";
  return (
    <section className="relative isolate overflow-hidden pt-32 pb-24 sm:pt-40">
      <div aria-hidden className="bg-grid absolute inset-0 -z-10" />
      <div className="container-x grid items-center gap-16 lg:grid-cols-[1.15fr_1fr]">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="chip !border-emerald-500/30 !bg-emerald-500/10 !text-emerald-700 dark:!text-emerald-300"
          >
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
            {dict.available}
          </motion.div>

          <h1 className="mt-6 text-5xl font-semibold leading-[1.02] tracking-tight sm:text-7xl">
            <motion.span
              className="block text-2xl font-normal text-muted sm:text-3xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease }}
            >
              {dict.hello}
            </motion.span>
            <span className="mt-1 block" aria-label={name}>
              {name.split("").map((ch, i) => (
                <motion.span
                  key={i}
                  aria-hidden
                  className="inline-block"
                  initial={{ opacity: 0, y: "60%", rotate: 8 }}
                  animate={{ opacity: 1, y: 0, rotate: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 + i * 0.05, ease }}
                  whileHover={{ y: -8, color: "var(--brand)", transition: { duration: 0.2 } }}
                >
                  {ch}
                </motion.span>
              ))}
              <motion.span
                aria-hidden
                className="ml-2 inline-block origin-[70%_70%]"
                initial={{ rotate: 0 }}
                animate={{ rotate: [0, 18, -8, 18, 0] }}
                transition={{ delay: 1, duration: 1.4 }}
              >
                👋
              </motion.span>
            </span>
            <motion.span
              className="mt-3 block text-3xl sm:text-5xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <RoleTyper roles={dict.roles} />
            </motion.span>
          </h1>

          <motion.p
            className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5, ease }}
          >
            {dict.intro}
          </motion.p>

          <motion.div
            className="mt-8 flex flex-wrap items-center gap-3"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.65, ease }}
          >
            <Magnetic>
              <a href="#projects" className="btn btn-primary group">
                {dict.ctaWork}
                <ArrowUpRight className="size-4 transition-transform group-hover:rotate-45" />
              </a>
            </Magnetic>
            <Magnetic>
              <a href={profile.cv} download className="btn btn-ghost">
                <Download className="size-4" />
                {dict.ctaCv}
              </a>
            </Magnetic>
            <div className="flex gap-1 pl-1">
              <a href={profile.github} target="_blank" rel="noreferrer" aria-label="GitHub" className="grid size-11 place-items-center rounded-full text-muted transition hover:bg-bg-2 hover:text-ink">
                <GithubIcon />
              </a>
              <a href={profile.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn" className="grid size-11 place-items-center rounded-full text-muted transition hover:bg-bg-2 hover:text-[#0a66c2]">
                <LinkedinIcon />
              </a>
            </div>
          </motion.div>

          <motion.div
            className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <span className="inline-flex items-center gap-1.5"><MapPin className="size-4 text-brand" />{dict.location}</span>
            {showRelocation && (
              <span className="inline-flex items-center gap-1.5"><Plane className="size-4 text-brand" />{dict.relocation}</span>
            )}
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.2, ease }}>
          <Portrait />
        </motion.div>
      </div>

      <a href="#about" className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1 text-xs text-muted sm:flex" aria-label={dict.scroll}>
        <span className="font-mono uppercase tracking-widest">{dict.scroll}</span>
        <ArrowDown className="size-4 animate-bounce" />
      </a>
    </section>
  );
}
