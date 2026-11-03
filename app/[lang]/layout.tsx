import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";
import { hasLocale, locales } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { profile, showRelocation } from "@/lib/content";
import { Nav } from "@/components/nav";
import { CommandPalette } from "@/components/command-palette";
import { ScrollProgress } from "@/components/scroll-progress";
import { CursorGlow } from "@/components/cursor-glow";
import { ViewTracker } from "@/components/view-tracker";
import { InlineScript } from "@/components/inline-script";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin", "latin-ext", "cyrillic"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin", "cyrillic"] });
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "latin-ext", "cyrillic"],
  style: ["italic"],
  weight: ["400", "500"],
});

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  const description = dict.meta.description + (showRelocation ? dict.meta.descriptionRelocation : "");
  return {
    metadataBase: new URL(profile.siteUrl),
    title: { default: dict.meta.title, template: `%s · Andreia Sirețanu` },
    description,
    alternates: {
      canonical: `/${lang}`,
      languages: Object.fromEntries(locales.map((l) => [l, `/${l}`])),
    },
    openGraph: {
      type: "profile",
      title: dict.meta.title,
      description,
      locale: lang,
      images: ["/me/main-photo.webp"],
    },
    twitter: { card: "summary_large_image", title: dict.meta.title, description },
    authors: [{ name: profile.fullName, url: profile.linkedin }],
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfaff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0814" },
  ],
};

const themeScript = `try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark')t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.dataset.theme=t}catch(e){}`;

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.fullName,
    jobTitle: "Front End Developer",
    email: `mailto:${profile.email}`,
    address: { "@type": "PostalAddress", addressLocality: "Chișinău", addressCountry: "MD" },
    alumniOf: "Technical University of Moldova",
    sameAs: [profile.github, profile.linkedin],
    knowsLanguage: ["ro", "ru", "en"],
  };

  return (
    <html
      lang={lang}
      data-theme="light"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} antialiased`}
    >
      <head>
        <InlineScript html={themeScript} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className="noise min-h-dvh overflow-x-clip">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-bg">
          Skip to content
        </a>
        <ScrollProgress />
        <CursorGlow />
        <Nav lang={lang} dict={dict.nav} />
        {children}
        <CommandPalette lang={lang} dict={dict.palette} nav={dict.nav} />
        <ViewTracker />
      </body>
    </html>
  );
}
