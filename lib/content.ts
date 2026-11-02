// Locale-independent facts about Andreia. Localised copy lives in lib/i18n/*.ts.

export const profile = {
  firstName: "Andreia",
  fullName: "Andreia-Cristina Sirețanu",
  email: "andreia.cristina.siretanu@gmail.com",
  phone: "+373 76 739 401",
  phoneHref: "tel:+37376739401",
  github: "https://github.com/AndyLy00",
  linkedin: "https://www.linkedin.com/in/andreia-cristina-siretanu-620a721bb/",
  cv: "/cv/Andreia-Siretanu-CV.pdf",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
};

/** Set to true to advertise relocation (hero line, "Work style" fact, meta description). */
export const showRelocation = false;

export const stats = [
  { key: "frontend", value: 3, suffix: "+" },
  { key: "fullstack", value: 1, suffix: "+" },
  { key: "websites", value: 25, suffix: "+" },
  { key: "languages", value: 3, suffix: "" },
] as const;

export type SkillGroup = "frontend" | "backend" | "commerce" | "tooling";

export const skills: { name: string; group: SkillGroup; level: number; color: string }[] = [
  { name: "React.js", group: "frontend", level: 92, color: "#61dafb" },
  { name: "JavaScript (ES6+)", group: "frontend", level: 92, color: "#f7df1e" },
  { name: "TypeScript", group: "frontend", level: 72, color: "#3178c6" },
  { name: "Next.js", group: "frontend", level: 78, color: "#a1a1aa" },
  { name: "Redux", group: "frontend", level: 82, color: "#764abc" },
  { name: "Vue.js", group: "frontend", level: 74, color: "#42b883" },
  { name: "HTML5", group: "frontend", level: 96, color: "#e34f26" },
  { name: "CSS3", group: "frontend", level: 94, color: "#1572b6" },
  { name: "Sass", group: "frontend", level: 88, color: "#cc6699" },
  { name: "Bootstrap", group: "frontend", level: 86, color: "#7952b3" },
  { name: "Node.js", group: "backend", level: 72, color: "#5fa04e" },
  { name: "Express.js", group: "backend", level: 70, color: "#a1a1aa" },
  { name: "REST API", group: "backend", level: 84, color: "#ff7a59" },
  { name: "GraphQL", group: "backend", level: 70, color: "#e10098" },
  { name: "MongoDB", group: "backend", level: 66, color: "#47a248" },
  { name: "PHP", group: "backend", level: 55, color: "#777bb4" },
  { name: "Better Auth", group: "backend", level: 74, color: "#e4e4e7" },
  { name: "Passkeys / WebAuthn", group: "backend", level: 70, color: "#10b981" },
  { name: "2FA (TOTP)", group: "backend", level: 72, color: "#f59e0b" },
  { name: "Magento 2", group: "commerce", level: 76, color: "#ee672f" },
  { name: "Venia / PWA Studio", group: "commerce", level: 74, color: "#f26322" },
  { name: "Stripe", group: "commerce", level: 70, color: "#635bff" },
  { name: "Sezzle", group: "commerce", level: 72, color: "#8b5cf6" },
  { name: "Twilio", group: "commerce", level: 62, color: "#f22f46" },
  { name: "Bubble.io", group: "commerce", level: 80, color: "#3c50e0" },
  { name: "Vite", group: "tooling", level: 84, color: "#a855f7" },
  { name: "Axios", group: "tooling", level: 88, color: "#5a29e4" },
  { name: "Git & GitHub", group: "tooling", level: 84, color: "#f05032" },
  { name: "Responsive UI", group: "tooling", level: 92, color: "#f24e1e" },
  { name: "PWA & Service Workers", group: "tooling", level: 78, color: "#5a0fc8" },
  { name: "Offline-first sync", group: "tooling", level: 72, color: "#0ea5e9" },
  { name: "Web Push", group: "tooling", level: 70, color: "#ec4899" },
  { name: "Capacitor (Android)", group: "tooling", level: 68, color: "#119eff" },
  { name: "i18n (EN / RO / RU)", group: "tooling", level: 86, color: "#22c55e" },
  { name: "Vercel", group: "tooling", level: 80, color: "#a1a1aa" },
];

export const marquee = [
  "React", "Next.js", "Redux", "Vue", "TypeScript", "Node.js", "Express", "GraphQL",
  "MongoDB", "Magento 2", "Venia UI", "Stripe", "Sezzle", "Twilio", "Bubble.io", "Sass", "Vite",
  "PWA", "Passkeys", "Capacitor", "Better Auth",
];

export type ExperienceMeta = {
  id: "axyys" | "appassion" | "noction" | "jivy" | "utm";
  company: string;
  start: string;
  end: string | null;
  stack: string[];
  kind: "work" | "education";
};

export const experience: ExperienceMeta[] = [
  { id: "axyys", company: "Axyys", start: "2024-10", end: null, kind: "work", stack: ["Magento 2", "PHP", "React", "Venia UI", "GraphQL", "Sezzle"] },
  { id: "appassion", company: "Appassion", start: "2023-06", end: "2024-09", kind: "work", stack: ["Next.js", "React", "Bubble.io", "Stripe", "Twilio", "REST"] },
  { id: "noction", company: "Noction", start: "2023-09", end: "2023-11", kind: "work", stack: ["Vue.js", "Scraping", "Node.js"] },
  { id: "jivy", company: "JivyGroup", start: "2022-12", end: "2023-02", kind: "work", stack: ["React", "Charts", "Reusable UI"] },
  { id: "utm", company: "Technical University of Moldova", start: "2021-09", end: "2025-06", kind: "education", stack: ["Software Engineering", "English programme"] },
];

export type ProjectKind = "fullstack" | "react" | "vue" | "landing";

export type ProjectMeta = {
  slug: string;
  year: number;
  kinds: ProjectKind[];
  stack: string[];
  /** Omit for private repositories. */
  github?: string;
  live?: string;
  liveDown?: boolean;
  image?: string;
  mobile?: string;
  accent: string;
  featured?: boolean;
};

export const projects: ProjectMeta[] = [
  {
    slug: "moldonyan-finance",
    year: 2026,
    kinds: ["fullstack", "react"],
    stack: ["Next.js App Router", "React", "Better Auth", "Passkeys (WebAuthn)", "TOTP 2FA", "PWA + offline service worker", "Capacitor (Android)", "Web Push", "i18n EN/RU/RO", "Vercel"],
    live: "https://moldonyan.top/about",
    image: "/projects/finance.webp",
    mobile: "/projects/finance-m.webp",
    accent: "#ea580c",
    featured: true,
  },
  {
    slug: "hr-tool",
    year: 2025,
    kinds: ["react", "fullstack"],
    stack: ["React 18", "Redux Toolkit", "React Router 7", "FullCalendar", "D3", "Kanban board", "Sass", "Vite"],
    github: "https://github.com/AndyLy00/HR-tool",
    live: "https://hr-tool-andy-ly.netlify.app/",
    image: "/projects/hr.webp",
    mobile: "/projects/hr-m.webp",
    accent: "#7c5cff",
    featured: true,
  },
  {
    slug: "target-solutions",
    year: 2025,
    kinds: ["react", "landing"],
    stack: ["React 18", "Vite", "Framer Motion", "react-slick carousels", "SCSS", "Responsive"],
    github: "https://github.com/AndyLy00/TargetSolutions",
    live: "https://targetsolution.netlify.app/",
    image: "/projects/targetsolutions.webp",
    mobile: "/projects/targetsolutions-m.webp",
    accent: "#1d3b4f",
    featured: true,
  },
  {
    slug: "mini-reactive-store",
    year: 2024,
    kinds: ["react"],
    stack: ["React", "TypeScript", "Redux", "JWT", "Protected routes", "Product catalog & cart", "Bootstrap", "Vite"],
    github: "https://github.com/AndyLy00/ebs-fe-test",
    live: "https://reactvitestore.netlify.app",
    image: "/projects/store.webp",
    mobile: "/projects/store-m.webp",
    accent: "#4f8cff",
    featured: true,
  },
  {
    slug: "clean-dent",
    year: 2025,
    kinds: ["landing"],
    stack: ["TypeScript", "i18n (RO/EN)", "Responsive", "WhatsApp CTA"],
    github: "https://github.com/AndyLy00/clean-dent",
    live: "https://andyly00.github.io/clean-dent/",
    image: "/projects/cleandent.webp",
    mobile: "/projects/cleandent-m.webp",
    accent: "#64748b",
    featured: true,
  },
  {
    slug: "bookmark-manager",
    year: 2022,
    kinds: ["react"],
    stack: ["React", "TypeScript", "CRUD", "Sorting & filtering", "PBL 2022"],
    github: "https://github.com/AndyLy00/bookmarkmanager-react",
    live: "https://bookmarkmanager107.netlify.app",
    image: "/projects/bookmark.webp",
    mobile: "/projects/bookmark-m.webp",
    accent: "#e879f9",
  },
  {
    slug: "animal-shop",
    year: 2023,
    kinds: ["vue", "landing"],
    stack: ["Vue.js", "Component layout", "CSS animations", "Netlify"],
    github: "https://github.com/AndyLy00/my-test-project/tree/master",
    live: "https://animalshop123.netlify.app",
    image: "/projects/animalshop.webp",
    mobile: "/projects/animalshop-m.webp",
    accent: "#ea580c",
  },
  {
    slug: "language-academy",
    year: 2024,
    kinds: ["landing", "react"],
    stack: ["React (CRA)", "RU / EN / FR switcher", "Pricing cards", "Reviews carousel", "FAQ accordion", "Responsive"],
    github: "https://github.com/AndyLy00/Test-Project",
    live: "https://testmyprojectabcde.netlify.app/",
    image: "/projects/academy.webp",
    mobile: "/projects/academy-m.webp",
    accent: "#14b8a6",
  },
  {
    slug: "fantasy-blog",
    year: 2022,
    kinds: ["landing"],
    stack: ["HTML5", "CSS3", "JavaScript", "Parallax", "GitHub Pages"],
    github: "https://github.com/AndyLy00/Lilo",
    live: "https://andyly00.github.io/Lilo/",
    image: "/projects/lilo.webp",
    mobile: "/projects/lilo-m.webp",
    accent: "#f472b6",
  },
  {
    slug: "animal-blog",
    year: 2022,
    kinds: ["landing"],
    stack: ["HTML5", "CSS3", "JavaScript", "Filterable gallery", "GitHub Pages"],
    github: "https://github.com/AndyLy00/Animals",
    live: "https://andyly00.github.io/Animals/",
    image: "/projects/animals.webp",
    mobile: "/projects/animals-m.webp",
    accent: "#d97706",
  },
];

export const gallery = [
  { src: "/me/nature", key: "nature" },
  { src: "/me/studio", key: "studio" },
  { src: "/me/evening", key: "evening" },
  { src: "/me/closeup", key: "closeup" },
] as const;
