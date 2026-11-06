/**
 * The site's public origin, used for canonical URLs, Open Graph, JSON-LD, the sitemap and robots.txt.
 *
 * Order: SITE_URL (explicit override) → Vercel's production domain (VERCEL_PROJECT_PRODUCTION_URL, which
 * becomes the custom domain once one is attached, after a redeploy) → the intended domain for local builds.
 */
export const DEFAULT_SITE_URL = "https://empowerwell.com.au";

export function resolveSiteUrl(env = process.env) {
  if (env.SITE_URL) return env.SITE_URL.replace(/\/$/, "");
  if (env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return DEFAULT_SITE_URL;
}
