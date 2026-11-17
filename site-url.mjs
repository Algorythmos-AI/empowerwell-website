/**
 * The site's public origin, used for canonical URLs, Open Graph, JSON-LD, the sitemap and robots.txt.
 *
 * Order: SITE_URL (explicit override) → Vercel's production domain (VERCEL_PROJECT_PRODUCTION_URL, which is
 * the custom domain empowerwellsupport.com.au) → the same domain for local builds.
 */
export const DEFAULT_SITE_URL = "https://empowerwellsupport.com.au";

export function resolveSiteUrl(env = process.env) {
  if (env.SITE_URL) return env.SITE_URL.replace(/\/$/, "");
  if (env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return DEFAULT_SITE_URL;
}
