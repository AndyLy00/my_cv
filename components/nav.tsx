"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Command, Menu, Moon, Sun, X } from "lucide-react";
import { locales, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/en";
import { toggleTheme } from "./theme";

export const SECTIONS = ["about", "skills", "experience", "projects", "guestbook", "contact"] as const;

export function switchLocalePath(pathname: string, to: Locale) {
  const parts = pathname.split("/");
  parts[1] = to;
  return parts.join("/") || `/${to}`;
}

export function rememberLocale(l: Locale) {
  document.cookie = `NEXT_LOCALE=${l}; path=/; max-age=31536000; samesite=lax`;
}

export function Nav({ lang, dict }: { lang: Locale; dict: Dictionary["nav"] }) {
  const pathname = usePathname();
  const isHome = pathname === `/${lang}`;
  const [active, setActive] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!isHome) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    for (const id of SECTIONS) {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, [isHome]);

  const href = (id: string) => (isHome ? `#${id}` : `/${lang}#${id}`);

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3">
      <nav
        className={`flex w-full max-w-6xl items-center justify-between gap-3 rounded-full border px-3 py-2 transition-all duration-500 ${
          scrolled ? "border-line bg-surface/75 shadow-[0_8px_30px_-12px_rgb(0_0_0/0.18)] backdrop-blur-xl" : "border-transparent"
        }`}
      >
        <Link href={`/${lang}`} className="group flex items-center gap-2 pl-2" aria-label="Andreia Sirețanu — home">
          <span className="grid size-8 place-items-center rounded-full bg-gradient-to-br from-brand to-brand-2 font-serif text-lg italic text-white transition-transform duration-500 group-hover:rotate-[360deg]">
            A
          </span>
          <span className="hidden font-semibold tracking-tight sm:inline">Andreia</span>
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {SECTIONS.map((id) => (
            <li key={id}>
              <a
                href={href(id)}
                className={`relative rounded-full px-3 py-1.5 text-sm transition-colors ${active === id ? "text-ink" : "text-muted hover:text-ink"}`}
              >
                {active === id && (
                  <motion.span layoutId="nav-pill" className="absolute inset-0 -z-10 rounded-full bg-bg-2" transition={{ type: "spring", bounce: 0.25, duration: 0.5 }} />
                )}
                {dict[id]}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("open-palette"))}
            className="hidden items-center gap-1.5 rounded-full border border-line px-2.5 py-1.5 text-xs text-muted transition hover:text-ink md:flex"
            aria-label={dict.palette}
          >
            <Command className="size-3.5" /> K
          </button>
          <div className="flex rounded-full border border-line p-0.5 text-xs" role="group" aria-label={dict.language}>
            {locales.map((l) => (
              <Link
                key={l}
                href={switchLocalePath(pathname, l)}
                onClick={() => rememberLocale(l)}
                scroll={false}
                hrefLang={l}
                aria-current={l === lang ? "true" : undefined}
                className={`rounded-full px-2 py-1 font-mono uppercase transition ${l === lang ? "bg-ink text-bg" : "text-muted hover:text-ink"}`}
              >
                {l}
              </Link>
            ))}
          </div>
          <button
            type="button"
            onClick={(e) => toggleTheme({ x: e.clientX, y: e.clientY })}
            className="grid size-9 place-items-center rounded-full text-muted transition hover:bg-bg-2 hover:text-ink"
            aria-label={dict.theme}
          >
            <Sun className="size-4 dark:hidden" />
            <Moon className="hidden size-4 dark:block" />
          </button>
          <a href={href("contact")} className="btn btn-primary hidden !py-2 sm:inline-flex">
            {dict.hire}
          </a>
          <button
            type="button"
            className="grid size-9 place-items-center rounded-full lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={dict.menu}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            className="card absolute inset-x-3 top-[4.5rem] p-3 shadow-xl lg:hidden"
          >
            <ul className="grid gap-1">
              {SECTIONS.map((id, i) => (
                <motion.li key={id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                  <a href={href(id)} onClick={() => setOpen(false)} className="block rounded-2xl px-4 py-3 text-lg font-medium hover:bg-bg-2">
                    {dict[id]}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
