import Image from "next/image";
import { Suspense } from "react";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { Code2, GraduationCap, LayoutDashboard, Mail, MapPin, Palette, Phone, Rocket, Server, ShoppingCart, Workflow } from "lucide-react";
import { getDictionary, getLocale, type Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";
import { experience, marquee, profile, showRelocation, stats } from "@/lib/content";
import { getStore } from "@/lib/db";
import { Hero } from "@/components/hero";
import { ProgressBar } from "@/components/progress-bar";
import { Reveal, WordsReveal } from "@/components/reveal";
import { Counter } from "@/components/counter";
import { SkillsExplorer } from "@/components/skills-explorer";
import { Timeline, type TimelineItem } from "@/components/timeline";
import { ProjectsGrid } from "@/components/projects-grid";
import { Gallery } from "@/components/gallery";
import { ContactForm, CopyEmail, GuestbookForm } from "@/components/forms";
import { GithubIcon, LinkedinIcon } from "@/components/icons";
import { Footer } from "@/components/footer";

export default async function Home() {
  const lang = await getLocale();
  const dict = await getDictionary(lang);

  return (
    <>
      <main id="main" className="relative z-10">
        <Hero dict={showRelocation ? dict.hero : { ...dict.hero, relocation: "" }} />
        <Marquee />
        <Stats dict={dict.stats} />
        <About dict={dict.about} />
        <Services dict={dict.services} />
        <Section id="skills" eyebrow={dict.skills.eyebrow} title={dict.skills.title}>
          <SkillsExplorer dict={dict.skills} />
        </Section>
        <Section id="experience" eyebrow={dict.experience.eyebrow} title={dict.experience.title}>
          <Timeline items={timelineItems(lang, dict)} />
        </Section>
        <Section id="projects" eyebrow={dict.projects.eyebrow} title={dict.projects.title}>
          <Suspense fallback={<ProjectsGrid lang={lang} dict={dict.projects} />}>
            <ProjectsWithLikes lang={lang} dict={dict.projects} />
          </Suspense>
        </Section>
        <Section id="beyond" eyebrow={dict.gallery.eyebrow} title={dict.gallery.title}>
          <p className="mt-3 font-mono text-xs text-muted">✦ {dict.gallery.hint}</p>
          <Gallery dict={dict.gallery} />
        </Section>
        <GuestbookSection dict={dict} />
        <Contact dict={dict} />
      </main>
      <Footer dict={dict.footer} />
    </>
  );
}

// ---------- layout helpers ----------

function Section({ id, eyebrow, title, children }: { id: string; eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="container-x py-24 sm:py-32">
      <Reveal>
        <span className="eyebrow">{eyebrow}</span>
      </Reveal>
      <h2 className="h2 max-w-3xl">
        <WordsReveal text={title} />
      </h2>
      <div className="mt-10">{children}</div>
    </section>
  );
}

function Marquee() {
  const row = [...marquee, ...marquee];
  return (
    <div className="marquee-mask relative overflow-hidden border-y border-line bg-surface/50 py-5" aria-hidden>
      <div className="animate-marquee flex w-max gap-10 whitespace-nowrap">
        {row.map((t, i) => (
          <span key={i} className="flex items-center gap-10 text-lg font-medium text-muted">
            {t}
            <span className="text-brand">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function Stats({ dict }: { dict: Dictionary["stats"] }) {
  return (
    <section className="container-x py-16">
      <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={s.key} delay={i * 0.08} className="card p-6 text-center sm:p-8">
            <dt className="sr-only">{dict[s.key]}</dt>
            <dd className="bg-gradient-to-br from-ink to-brand bg-clip-text text-5xl font-semibold tracking-tight text-transparent sm:text-6xl">
              <Counter to={s.value} suffix={s.suffix} />
            </dd>
            <p aria-hidden className="mt-2 text-sm text-muted">{dict[s.key]}</p>
          </Reveal>
        ))}
      </dl>
    </section>
  );
}

function About({ dict }: { dict: Dictionary["about"] }) {
  const facts = [
    { icon: MapPin, k: dict.facts.based, v: dict.facts.basedValue },
    { icon: GraduationCap, k: dict.facts.education, v: dict.facts.educationValue },
    { icon: Rocket, k: dict.facts.remote, v: dict.facts.remoteValue + (showRelocation ? dict.facts.remoteRelocation : "") },
    { icon: Code2, k: dict.facts.focus, v: dict.facts.focusValue },
  ];
  return (
    <section id="about" className="container-x grid gap-14 py-24 sm:py-32 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
      <Reveal className="relative mx-auto w-full max-w-sm lg:sticky lg:top-28">
        <div aria-hidden className="absolute -inset-3 -rotate-3 rounded-[2rem] bg-gradient-to-br from-brand-3/40 via-brand/30 to-brand-2/40 blur-sm" />
        <figure className="group relative overflow-hidden rounded-[2rem] border-4 border-surface shadow-2xl">
          <Image src="/me/about-duo.webp" alt="" width={900} height={1125} sizes="(max-width: 1024px) 90vw, 400px" className="h-auto w-full" />
          <Image
            src="/me/about.webp"
            alt="Andreia Sirețanu"
            fill
            sizes="(max-width: 1024px) 90vw, 400px"
            className="object-cover opacity-0 transition-all duration-1000 group-hover:scale-105 group-hover:opacity-100"
          />
        </figure>
      </Reveal>

      <div>
        <Reveal>
          <span className="eyebrow">{dict.eyebrow}</span>
        </Reveal>
        <h2 className="h2">
          <WordsReveal text={dict.title} /> <span className="accent">{dict.accent}</span>
        </h2>
        <Reveal delay={0.1} className="mt-6 space-y-4 text-lg leading-relaxed text-muted">
          <p>{dict.p1}</p>
          <p>{dict.p2}</p>
          <p>{dict.p3}</p>
        </Reveal>
        <Reveal delay={0.2}>
          <dl className="mt-8 grid gap-3 sm:grid-cols-2">
            {facts.map(({ icon: Icon, k, v }) => (
              <div key={k} className="flex items-start gap-3 rounded-2xl border border-line p-4">
                <Icon className="mt-0.5 size-5 shrink-0 text-brand" />
                <div>
                  <dt className="text-xs uppercase tracking-wider text-muted">{k}</dt>
                  <dd className="font-medium">{v}</dd>
                </div>
              </div>
            ))}
          </dl>
        </Reveal>
        <Reveal delay={0.3} className="mt-8">
          <h3 className="font-mono text-xs uppercase tracking-widest text-muted">{dict.languagesTitle}</h3>
          <ul className="mt-4 space-y-3">
            {dict.languages.map((l, i) => (
              <li key={l.name}>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{l.name}</span>
                  <span className="font-mono text-brand">{l.level}</span>
                </div>
                <ProgressBar
                  value={l.value}
                  delay={0.2 + i * 0.15}
                  trackClassName="mt-1.5 h-2 overflow-hidden rounded-full bg-bg-2"
                  className="rounded-full bg-gradient-to-r from-brand to-brand-2"
                />
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

const serviceIcons = { palette: Palette, cart: ShoppingCart, server: Server, dashboard: LayoutDashboard, workflow: Workflow, rocket: Rocket };

function Services({ dict }: { dict: Dictionary["services"] }) {
  return (
    <section className="relative py-24 sm:py-32">
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-bg-2/70 to-transparent" />
      <div className="container-x">
        <Reveal>
          <span className="eyebrow">{dict.eyebrow}</span>
        </Reveal>
        <h2 className="h2">
          <WordsReveal text={dict.title} />
        </h2>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {dict.items.map((s, i) => {
            const Icon = serviceIcons[s.icon as keyof typeof serviceIcons] ?? Rocket;
            return (
              <Reveal key={s.title} delay={(i % 3) * 0.08} className={i === 0 || i === 4 ? "lg:col-span-2" : ""}>
                <div className="card group relative h-full overflow-hidden p-7 transition-all duration-500 hover:-translate-y-1 hover:border-brand/40">
                  <div aria-hidden className="absolute -right-16 -top-16 size-40 rounded-full bg-brand/10 transition-transform duration-700 group-hover:scale-150" />
                  <span className="relative grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-brand to-brand-2 text-white shadow-lg transition-transform duration-500 group-hover:rotate-[-8deg] group-hover:scale-110">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="relative mt-5 text-lg font-semibold">{s.title}</h3>
                  <p className="relative mt-2 leading-relaxed text-muted">{s.text}</p>
                  <span className="absolute right-6 top-6 font-mono text-xs text-muted/60">0{i + 1}</span>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function timelineItems(lang: Locale, dict: Dictionary): TimelineItem[] {
  const fmt = new Intl.DateTimeFormat(lang === "en" ? "en-GB" : lang, { month: "short", year: "numeric", timeZone: "UTC" });
  const d = (s: string) => fmt.format(new Date(`${s}-01T00:00:00Z`));
  return experience.map((e) => {
    const t = dict.experience.items[e.id];
    return {
      id: e.id,
      company: e.company,
      role: t.role,
      location: t.location,
      bullets: t.bullets,
      stack: e.stack,
      kind: e.kind,
      current: e.end === null,
      period: `${d(e.start)} — ${e.end ? d(e.end) : dict.experience.present}`,
    };
  });
}

// ---------- dynamic (database-backed) parts ----------

async function ProjectsWithLikes({ lang, dict }: { lang: Locale; dict: Dictionary["projects"] }) {
  await connection();
  const visitor = (await cookies()).get("cv_vid")?.value;
  const data = await getStore()
    .then((s) => Promise.all([s.likeCounts(), visitor ? s.likedBy(visitor) : []]))
    .catch((e) => {
      console.error("Loading likes failed", e);
      return null;
    });
  return <ProjectsGrid lang={lang} dict={dict} likes={data?.[0]} liked={data?.[1]} />;
}

function GuestbookSection({ dict }: { dict: Dictionary }) {
  const g = dict.guestbook;
  return (
    <section id="guestbook" className="container-x py-24 sm:py-32">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <Reveal>
            <span className="eyebrow">{g.eyebrow}</span>
          </Reveal>
          <h2 className="h2">
            <WordsReveal text={g.title} />
          </h2>
          <Reveal delay={0.1}>
            <p className="mt-4 text-muted">{g.subtitle}</p>
          </Reveal>
          <Reveal delay={0.15} className="mt-8">
            <GuestbookForm dict={g} errors={dict.errors} />
          </Reveal>
        </div>
        <Suspense fallback={<WallSkeleton />}>
          <GuestbookWall empty={g.empty} />
        </Suspense>
      </div>
    </section>
  );
}

function WallSkeleton() {
  return (
    <div className="columns-1 gap-4 sm:columns-2">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="card mb-4 h-32 animate-pulse break-inside-avoid" />
      ))}
    </div>
  );
}

async function GuestbookWall({ empty }: { empty: string }) {
  await connection();
  const entries = await getStore()
    .then((s) => s.approvedGuestbook(12))
    .catch((e) => {
      console.error("Loading guestbook failed", e);
      return [];
    });
  if (entries.length === 0) {
    return (
      <div className="grid min-h-60 place-items-center rounded-3xl border-2 border-dashed border-line p-10 text-center text-muted">
        <p>
          <span className="mb-3 block text-4xl">🖊️</span>
          {empty}
        </p>
      </div>
    );
  }
  const tilts = ["-rotate-1", "rotate-1", "rotate-0", "-rotate-2", "rotate-2"];
  return (
    <ul className="columns-1 gap-4 sm:columns-2">
      {entries.map((e, i) => (
        <li key={e.id} className="mb-4 break-inside-avoid">
          <Reveal delay={(i % 4) * 0.06}>
            <figure className={`card p-5 transition-transform duration-300 hover:rotate-0 hover:scale-[1.02] ${tilts[i % tilts.length]}`}>
              <span className="text-2xl">{e.emoji}</span>
              <blockquote className="mt-2 font-serif text-lg italic leading-snug">“{e.message}”</blockquote>
              <figcaption className="mt-3 text-sm">
                <b>{e.name}</b>
                {e.role && <span className="text-muted"> · {e.role}</span>}
              </figcaption>
            </figure>
          </Reveal>
        </li>
      ))}
    </ul>
  );
}

function Contact({ dict }: { dict: Dictionary }) {
  const c = dict.contact;
  return (
    <section id="contact" className="relative overflow-hidden py-24 sm:py-32">
      <div aria-hidden className="animate-blob absolute -left-40 top-20 -z-10 size-[28rem] bg-brand/15 blur-3xl" />
      <div aria-hidden className="animate-blob absolute -right-40 bottom-0 -z-10 size-[24rem] bg-brand-2/15 blur-3xl [animation-delay:-5s]" />
      <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.15fr]">
        <div>
          <Reveal>
            <span className="eyebrow">{c.eyebrow}</span>
          </Reveal>
          <h2 className="h2">
            <WordsReveal text={c.title} /> <span className="accent">{c.accent}</span>
          </h2>
          <Reveal delay={0.1}>
            <p className="mt-5 max-w-md text-lg text-muted">{c.text}</p>
          </Reveal>
          <Reveal delay={0.2} className="mt-8 space-y-3">
            <p className="font-mono text-xs uppercase tracking-widest text-muted">{c.or}</p>
            <a href={`mailto:${profile.email}`} className="flex items-center gap-3 text-lg font-medium hover:text-brand">
              <Mail className="size-5 text-brand" /> <span className="break-all">{profile.email}</span>
            </a>
            <a href={profile.phoneHref} className="flex items-center gap-3 text-lg font-medium hover:text-brand">
              <Phone className="size-5 text-brand" /> {profile.phone}
            </a>
            <div className="flex flex-wrap gap-2 pt-3">
              <CopyEmail email={profile.email} label={c.copy} done={c.copied} />
              <a href={profile.github} target="_blank" rel="noreferrer" className="btn btn-ghost !py-2"><GithubIcon className="size-4" /> GitHub</a>
              <a href={profile.linkedin} target="_blank" rel="noreferrer" className="btn btn-ghost !py-2"><LinkedinIcon className="size-4" /> LinkedIn</a>
            </div>
          </Reveal>
        </div>
        <Reveal delay={0.1}>
          <ContactForm dict={c} errors={dict.errors} />
        </Reveal>
      </div>
    </section>
  );
}
