import type { MetadataRoute } from "next";
import { profile } from "@/lib/content";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/en/admin", "/ro/admin", "/ru/admin"] },
    sitemap: `${profile.siteUrl}/sitemap.xml`,
  };
}
