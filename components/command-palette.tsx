"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Copy, Download, Globe, Search, SunMoon } from "lucide-react";
import { locales, localeNames, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/en";
import { profile } from "@/lib/content";
import { GithubIcon, LinkedinIcon } from "./icons";
import { SECTIONS, rememberLocale, switchLocalePath } from "./nav";
import { toggleTheme } from "./theme";

type Item = { id: string; group: string; label: string; icon: ReactNode; run: () => void };

export function CommandPalette({ lang, dict, nav }: { lang: Locale; dict: Dictionary["palette"]; nav: Dictionary["nav"] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const openRef = useRef(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const show = () => {
      setQuery("");
      setIndex(0);
      setOpen(true);
    };
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (openRef.current) setOpen(false);
        else show();
      } else if (e.key === "Escape") setOpen(false);
    };
    const onOpen = () => show();
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-palette", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-palette", onOpen);
    };
  }, []);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  const items = useMemo<Item[]>(() => {
    const go = (id: string) => () => {
      if (pathname === `/${lang}`) document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      else router.push(`/${lang}#${id}`);
    };
    const list: Item[] = SECTIONS.map((id) => ({ id, group: dict.navigate, label: nav[id], icon: <ArrowRight className="size-4" />, run: go(id) }));
    list.push(
      {
        id: "copy",
        group: dict.actions,
        label: dict.copyEmail,
        icon: <Copy className="size-4" />,
        run: () => {
          navigator.clipboard?.writeText(profile.email);
          setToast(profile.email);
          setTimeout(() => setToast(null), 1800);
        },
      },
      { id: "cv", group: dict.actions, label: dict.downloadCv, icon: <Download className="size-4" />, run: () => window.open(profile.cv, "_blank") },
      { id: "theme", group: dict.actions, label: dict.toggleTheme, icon: <SunMoon className="size-4" />, run: () => toggleTheme() },
      { id: "gh", group: dict.actions, label: dict.github, icon: <GithubIcon className="size-4" />, run: () => window.open(profile.github, "_blank") },
      { id: "li", group: dict.actions, label: dict.linkedin, icon: <LinkedinIcon className="size-4" />, run: () => window.open(profile.linkedin, "_blank") },
    );
    for (const l of locales) {
      if (l === lang) continue;
      list.push({
        id: `lang-${l}`,
        group: dict.languages,
        label: localeNames[l],
        icon: <Globe className="size-4" />,
        run: () => {
          rememberLocale(l);
          router.push(switchLocalePath(pathname, l));
        },
      });
    }
    return list;
  }, [dict, nav, lang, pathname, router]);

  const filtered = items.filter((i) => i.label.toLowerCase().includes(query.toLowerCase()));

  const run = (item?: Item) => {
    if (!item) return;
    setOpen(false);
    item.run();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndex((i) => (i + 1) % Math.max(filtered.length, 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndex((i) => (i - 1 + filtered.length) % Math.max(filtered.length, 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      run(filtered[index]);
    }
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-start justify-center bg-black/30 px-4 pt-[14vh] backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={nav.palette}
              initial={{ opacity: 0, y: -16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
              className="w-full max-w-lg overflow-hidden rounded-3xl border border-line bg-surface shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 border-b border-line px-4">
                <Search className="size-4 text-muted" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setIndex(0);
                  }}
                  onKeyDown={onKeyDown}
                  placeholder={dict.placeholder}
                  className="h-14 flex-1 bg-transparent text-sm outline-none placeholder:text-muted focus-visible:outline-none"
                  role="combobox"
                  aria-expanded="true"
                  aria-controls="palette-list"
                  aria-activedescendant={filtered[index] ? `cmd-${filtered[index].id}` : undefined}
                />
                <kbd className="rounded-md border border-line px-1.5 py-0.5 font-mono text-[10px] text-muted">ESC</kbd>
              </div>
              <ul id="palette-list" role="listbox" className="max-h-[50vh] overflow-y-auto p-2">
                {filtered.length === 0 && <li className="px-3 py-8 text-center text-sm text-muted">{dict.empty}</li>}
                {filtered.map((item, i) => {
                  const header = item.group !== filtered[i - 1]?.group ? item.group : null;
                  return (
                    <li key={item.id} role="presentation">
                      {header && <div className="px-3 pb-1 pt-3 font-mono text-[10px] uppercase tracking-widest text-muted">{header}</div>}
                      <button
                        id={`cmd-${item.id}`}
                        role="option"
                        aria-selected={i === index}
                        type="button"
                        onMouseEnter={() => setIndex(i)}
                        onClick={() => run(item)}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                          i === index ? "bg-brand text-white" : "text-ink"
                        }`}
                      >
                        {item.icon}
                        {item.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 z-[90] -translate-x-1/2 rounded-full bg-ink px-4 py-2 text-sm text-bg shadow-lg"
            role="status"
          >
            ✓ {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
