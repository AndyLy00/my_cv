# Andreia Sirețanu — personal CV website

A trilingual (EN / RO / RU) portfolio built with **Next.js 16** (App Router, Cache Components, Partial Prerendering), **React 19**, **Tailwind CSS 4**, **Motion** and **Netlify Blobs** — with a zero-setup SQLite fallback for local development.

## Features

- **Hero** – letter-by-letter name reveal, typing role rotator, 3D-tilt portrait, magnetic buttons, floating tech badges.
- **About / stats / languages** – animated counters and progress bars.
- **What I can do** – service bento grid.
- **Skills explorer** – filter by area; animated confidence bars.
- **Experience timeline** – scroll-linked progress line.
- **Projects** – filterable grid; browser mockups auto-scroll full-page screenshots on hover; likes persisted; a case-study page per project with desktop + phone mockups.
- **Beyond the code** – draggable polaroid wall.
- **Guestbook** – visitors sign, you approve in the dashboard.
- **Contact form** – validated server action, honeypot + rate limit, saved to storage, optional email alert, confetti on success.
- **⌘K command palette**, light/dark theme with circular reveal, scroll progress, cursor glow, `prefers-reduced-motion` support.
- **Admin dashboard** at `/en/admin` – messages inbox, guestbook moderation, 14-day views chart, likes per project.
- SEO: localized metadata, `hreflang`, sitemap, robots, JSON-LD `Person`.

## Getting started

```bash
pnpm install
pnpm dev            # http://localhost:3000 → redirects to /en, /ro or /ru
```

Create `.env.local` to enable the admin dashboard:

```bash
ADMIN_PASSWORD=choose-a-long-password
SESSION_SECRET=any-long-random-string          # optional, signs the admin cookie
NEXT_PUBLIC_SITE_URL=https://your-domain.com   # used for canonical URLs / sitemap
# DATABASE_PATH=/absolute/path/cv.db           # optional, defaults to ./data/cv.db
```

## Project structure

```
app/[lang]/                 pages (home, projects/[slug], admin) — root layout lives here
lib/content.ts              facts: projects, skills, experience (locale independent)
lib/i18n/{en,ro,ru}.ts      all copy, typed against the English dictionary
lib/db/index.ts             storage entry point: Netlify Blobs on Netlify, else SQLite
lib/db/blobs.ts             Netlify Blobs storage; key layout documented at the top of the file
lib/db/sqlite.ts            local fallback (node:sqlite file in ./data)
lib/actions.ts              server actions: contact, guestbook, likes, views, admin
lib/auth.ts                 HMAC-signed admin session cookie
lib/email.ts                email alerts for new messages and notes (Resend)
components/                 UI (client components are marked "use client")
proxy.ts                    locale detection + redirect
public/me, public/projects  processed photos and project screenshots
```

To add a project: add an entry to `projects` in `lib/content.ts`, its copy under `projects.items` in each dictionary, and a screenshot in `public/projects/`.

## Deploying to Netlify

1. Push the repo to GitHub and import it in Netlify (**Add new project → Import an existing project**). Build settings come from `netlify.toml` (`pnpm run build`, Node 22); Next.js 16 is detected automatically.
2. **Storage:** nothing to set up. Netlify Blobs is available to the deployed site automatically, and its data persists across deploys.
3. **Environment variables** (Site configuration → Environment variables):
   - `ADMIN_PASSWORD` – password for `/en/admin`
   - `SESSION_SECRET` – a long random string (signs the admin cookie)
   - `NEXT_PUBLIC_SITE_URL` – e.g. `https://your-site.netlify.app`
   - `RESEND_API_KEY` – optional; emails you when someone sends a message or note ([resend.com](https://resend.com)). `ALERT_EMAIL_TO` and `ALERT_EMAIL_FROM` override the recipient and sender.
4. Deploy. The contact form, guestbook, likes and view counter now write to Netlify Blobs; read and moderate everything at `/en/admin`.

Locally, `pnpm dev` uses `./data/cv.db` (SQLite). To use a local Blobs sandbox instead, run `npx netlify dev`.
