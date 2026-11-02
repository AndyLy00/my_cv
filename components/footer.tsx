import { Suspense } from "react";
import { connection } from "next/server";
import { ArrowUp, Eye } from "lucide-react";
import { getStore } from "@/lib/db";
import { profile } from "@/lib/content";
import type { Dictionary } from "@/lib/i18n/en";
import { GithubIcon, LinkedinIcon } from "./icons";

async function Views({ label }: { label: string }) {
  await connection();
  const n = await getStore()
    .then((s) => s.totalViews())
    .catch(() => null);
  if (n === null) return null;
  return (
    <span className="inline-flex items-center gap-1.5">
      <Eye className="size-3.5" /> <span className="tabular-nums">{n.toLocaleString("en")}</span> {label}
    </span>
  );
}

async function Year() {
  "use cache";
  return <>{new Date().getFullYear()}</>;
}

export function Footer({ dict }: { dict: Dictionary["footer"] }) {
  return (
    <footer className="relative z-10 border-t border-line">
      <div className="container-x flex flex-col items-center justify-between gap-6 py-10 text-sm text-muted md:flex-row">
        <div className="text-center md:text-left">
          <p className="font-medium text-ink">© <Year /> {profile.fullName}</p>
          <p className="mt-1">{dict.built}</p>
        </div>
        <div className="flex items-center gap-5">
          <Suspense fallback={<span className="inline-flex items-center gap-1.5"><Eye className="size-3.5" /> … {dict.views}</span>}>
            <Views label={dict.views} />
          </Suspense>
          <a href={profile.github} target="_blank" rel="noreferrer" aria-label="GitHub" className="hover:text-ink"><GithubIcon className="size-4" /></a>
          <a href={profile.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn" className="hover:text-ink"><LinkedinIcon className="size-4" /></a>
          <a href="#main" className="grid size-9 place-items-center rounded-full border border-line transition hover:-translate-y-0.5 hover:text-ink" aria-label={dict.top}>
            <ArrowUp className="size-4" />
          </a>
        </div>
      </div>
    </footer>
  );
}
