import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/programs", "/pathway", "/login", "/contact", "/privacy-policy", "/terms"],
        disallow: ["/api/", "/portal/", "/teacher/", "/developer/", "/ai-knowledge/"]
      }
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl
  };
}
