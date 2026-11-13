import type { MetadataRoute } from "next";
import { SITE, TOOLS, SCHOOL_FINDER, REFERENCE_PAGES } from "@/lib/site";

// Last substantive content update. Bump when page content changes.
const LAST_MODIFIED = new Date("2026-11-13");

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["/", ...TOOLS.map((t) => t.href), SCHOOL_FINDER.href, ...REFERENCE_PAGES.map((p) => p.href)];
  return paths.map((p) => ({
    url: p === "/" ? SITE.url + "/" : SITE.url + p,
    lastModified: LAST_MODIFIED,
    changeFrequency: p === "/" ? "monthly" : "yearly",
    priority: p === "/" ? 1 : TOOLS.some((t) => t.href === p) ? 0.9 : 0.6,
  }));
}
