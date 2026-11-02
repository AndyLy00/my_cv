import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n/config";
import { profile, projects } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["", ...projects.map((p) => `/projects/${p.slug}`)];
  return paths.flatMap((p) =>
    locales.map((l) => ({
      url: `${profile.siteUrl}/${l}${p}`,
      changeFrequency: "monthly" as const,
      priority: p === "" ? 1 : 0.7,
      alternates: { languages: Object.fromEntries(locales.map((x) => [x, `${profile.siteUrl}/${x}${p}`])) },
    })),
  );
}
