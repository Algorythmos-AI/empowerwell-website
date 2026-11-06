import type { APIRoute } from "astro";
import { BRAND_COLORS, SITE } from "../content/site";

export const GET: APIRoute = () =>
  new Response(
    JSON.stringify(
      {
        id: "/",
        name: SITE.legalName,
        short_name: SITE.brandName,
        description: SITE.tagline,
        start_url: "/",
        scope: "/",
        lang: "en-AU",
        display: "standalone",
        theme_color: BRAND_COLORS.themeColor,
        background_color: BRAND_COLORS.background,
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
        ],
      },
      null,
      2,
    ),
    { headers: { "Content-Type": "application/manifest+json" } },
  );
