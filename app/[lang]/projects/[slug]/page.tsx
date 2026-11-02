import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight, CheckCircle2, CloudOff, Lock } from "lucide-react";
import { projects } from "@/lib/content";
import { hasLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { BrowserFrame, PhoneFrame } from "@/components/browser-frame";
import { GithubIcon } from "@/components/icons";
import { Reveal, WordsReveal } from "@/components/reveal";
import { Footer } from "@/components/footer";

export async function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/projects/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project || !hasLocale(lang)) return {};
  const t = (await getDictionary(lang)).projects.items[slug];
  return {
    title: t.title,
    description: t.summary,
    openGraph: { title: t.title, description: t.summary, images: project.image ? [project.image] : undefined },
  };
}

type Params = PageProps<"/[lang]/projects/[slug]">["params"];

// The page itself never awaits `params`, so client navigations between case studies
// render the skeleton instantly while the content streams in.
export default function ProjectPage({ params }: PageProps<"/[lang]/projects/[slug]">) {
  return (
    <Suspense fallback={<ProjectSkeleton />}>
      <ProjectContent params={params} />
    </Suspense>
  );
}

function ProjectSkeleton() {
  return (
    <main className="container-x relative z-10 animate-pulse pt-28" aria-busy="true">
      <div className="h-4 w-40 rounded-full bg-bg-2" />
      <div className="mt-10 h-14 w-2/3 rounded-2xl bg-bg-2" />
      <div className="mt-4 h-6 w-1/3 rounded-full bg-bg-2" />
      <div className="mt-12 h-[460px] rounded-2xl bg-bg-2" />
    </main>
  );
}

async function ProjectContent({ params }: { params: Params }) {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) notFound();
  const index = projects.findIndex((p) => p.slug === slug);
  if (index === -1) notFound();

  const project = projects[index];
  const next = projects[(index + 1) % projects.length];
  const dict = await getDictionary(lang);
  const d = dict.projects;
  const t = d.items[slug];

  return (
    <>
      <main id="main" className="relative z-10 pt-28">
        <div aria-hidden className="absolute inset-x-0 top-0 -z-10 h-[520px] opacity-30 blur-3xl" style={{ background: `radial-gradient(ellipse at 50% 0%, ${project.accent}, transparent 70%)` }} />
        <article className="container-x">
          <Reveal>
            <Link href={`/${lang}#projects`} className="group inline-flex items-center gap-2 text-sm text-muted hover:text-ink">
              <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" /> {d.back}
            </Link>
          </Reveal>

          <header className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-end">
            <div>
              <Reveal>
                <span className="eyebrow">{d.caseStudy} · {project.year}</span>
              </Reveal>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-6xl">
                <WordsReveal text={t.title} />
              </h1>
              <Reveal delay={0.1}>
                <p className="mt-3 font-serif text-2xl italic text-muted">{t.tagline}</p>
              </Reveal>
            </div>
            <Reveal delay={0.2} className="flex flex-wrap gap-2 lg:justify-end">
              {project.live && !project.liveDown && (
                <a href={project.live} target="_blank" rel="noreferrer" className="btn btn-primary group">
                  {d.live} <ArrowUpRight className="size-4 transition-transform group-hover:rotate-45" />
                </a>
              )}
              {project.liveDown && (
                <span className="chip !py-2"><CloudOff className="size-3.5" /> {d.offline}</span>
              )}
              {project.github ? (
                <a href={project.github} target="_blank" rel="noreferrer" className="btn btn-ghost">
                  <GithubIcon className="size-4" /> {d.code}
                </a>
              ) : (
                <span className="chip !py-2"><Lock className="size-3.5" /> {d.privateRepo}</span>
              )}
            </Reveal>
          </header>

          <Reveal delay={0.15} className="mt-12 grid items-end gap-8 lg:grid-cols-[1fr_auto]">
            <div className="group">
              <p className="mb-3 font-mono text-xs uppercase tracking-widest text-muted">{d.desktop} · ↕ hover</p>
              <BrowserFrame project={project} height={460} priority />
            </div>
            {project.mobile && (
              <div className="hidden lg:block">
                <p className="mb-3 text-center font-mono text-xs uppercase tracking-widest text-muted">{d.mobile}</p>
                <PhoneFrame src={project.mobile} alt={`${t.title} — ${d.mobile}`} />
              </div>
            )}
          </Reveal>

          <div className="mt-20 grid gap-12 lg:grid-cols-[1.5fr_1fr]">
            <div className="space-y-12">
              {[
                [d.overview, t.summary],
                [d.challenge, t.challenge],
                [d.solution, t.solution],
              ].map(([h, body], i) => (
                <Reveal key={h} delay={i * 0.05}>
                  <h2 className="flex items-center gap-3 text-2xl font-semibold">
                    <span className="font-mono text-sm text-brand">0{i + 1}</span> {h}
                  </h2>
                  <p className="mt-3 text-lg leading-relaxed text-muted">{body}</p>
                </Reveal>
              ))}
              <Reveal>
                <h2 className="flex items-center gap-3 text-2xl font-semibold">
                  <span className="font-mono text-sm text-brand">04</span> {d.features}
                </h2>
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {t.features.map((f) => (
                    <li key={f} className="card flex items-start gap-3 p-4">
                      <CheckCircle2 className="mt-0.5 size-5 shrink-0" style={{ color: project.accent }} />
                      {f}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>

            <aside className="lg:sticky lg:top-28 lg:self-start">
              <Reveal className="card space-y-6 p-6">
                <div>
                  <h3 className="font-mono text-xs uppercase tracking-widest text-muted">{d.role}</h3>
                  <p className="mt-1 font-medium">{t.role}</p>
                </div>
                <div>
                  <h3 className="font-mono text-xs uppercase tracking-widest text-muted">{d.year}</h3>
                  <p className="mt-1 font-medium">{project.year}</p>
                </div>
                <div>
                  <h3 className="font-mono text-xs uppercase tracking-widest text-muted">{d.stack}</h3>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {project.stack.map((s) => (
                      <span key={s} className="chip">{s}</span>
                    ))}
                  </div>
                </div>
              </Reveal>
            </aside>
          </div>

          <Reveal className="my-24">
            <Link
              href={`/${lang}/projects/${next.slug}`}
              className="card group flex items-center justify-between gap-6 overflow-hidden p-8 transition hover:border-brand/40 sm:p-12"
            >
              <div>
                <p className="font-mono text-xs uppercase tracking-widest text-muted">{d.next}</p>
                <p className="mt-2 text-3xl font-semibold tracking-tight transition-colors group-hover:text-brand sm:text-5xl">{d.items[next.slug].title}</p>
              </div>
              <span className="grid size-14 shrink-0 place-items-center rounded-full bg-ink text-bg transition-transform duration-500 group-hover:translate-x-2 group-hover:bg-brand">
                <ArrowRight className="size-6" />
              </span>
            </Link>
          </Reveal>
        </article>
      </main>
      <Footer dict={dict.footer} />
    </>
  );
}
