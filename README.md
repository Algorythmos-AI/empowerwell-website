# Empowerwell Support — website

Marketing and referral website for Empowerwell Support Pty Ltd, a registered NDIS provider in Dharruk NSW 2770 serving Western Sydney, Greater Sydney and regional NSW.

| | |
|---|---|
| **Status** | Live on the client's domain; awaiting client content |
| **Owner** | [@Algorythmos-AI/maintainers](https://github.com/orgs/Algorythmos-AI/teams/maintainers) |
| **Runs at** | <https://empowerwellsupport.com.au> (Vercel project `empowerwell-website`, deploys from `main`; DNS on Cloudflare, DNS-only) |
| **Run locally** | `npm ci && npm run dev` |
| **Context** | [Org repository map](https://github.com/Algorythmos-AI/.github-private/blob/main/profile/README.md#repository-map) · [Glossary](https://github.com/Algorythmos-AI/.github-private/blob/main/docs/glossary.md) |

---

Static site built with **Astro 7**, **TypeScript (strict)**, **Tailwind CSS v4** (`@theme` brand tokens) and self-hosted fonts (`@fontsource`). React runs only on the contact page (the enquiry form); the menu is a native `<dialog>` and the FAQs are native `<details>`. Built for **WCAG 2.2 AA**.

## Quick start

Requires Node 24 (see `.nvmrc`; Astro 7 needs Node 22.23.4 or later).

```bash
npm ci            # install exact locked dependencies
npm run dev       # http://localhost:3000
npm run check     # the full gate: astro check, tsc, ESLint, unit tests, build, dist verification
npm run preview   # serve the production build
```

`npm run check` must pass before every commit. It runs:

| Step | What it catches |
|---|---|
| `astro check` | Type errors in `.astro` files |
| `tsc --noEmit` + `eslint .` | Type errors, React hook misuse, accessibility lint (`jsx-a11y`) |
| `vitest run` | Enquiry validation, honeypot, mailto encoding, POST success / failure / timeout |
| `astro build` | Build errors |
| `scripts/verify-dist.mjs` | Per-page title / description / canonical / Open Graph (unique, correct), 404 is `noindex`, JSON-LD validity, broken internal links, images without `alt`/size, remote placeholder images, Google Fonts, malformed SVGs, raw hex colours or hard-coded contact details in components |

## Project structure

```
├── public/
│   ├── favicon.ico, favicon-16/32.png, apple-touch-icon.png, icon-192/512.png   # generated from the logo
│   ├── logo.png, og-image.png                                                  # generated from the logo
│   └── images/                     # illustrated SVG placeholders, awaiting real photography
├── site-url.mjs                    # public origin: SITE_URL → Vercel production domain → empowerwellsupport.com.au
├── scripts/
│   ├── build-brand-assets.mjs      # regenerates every logo-derived asset (npm run brand-assets)
│   └── verify-dist.mjs             # post-build spec checks (part of npm run check)
├── src/
│   ├── assets/brand/               # logo-source.png (client file) + generated emblem / lockup
│   ├── components/
│   │   ├── ui/                     # Button, Card, Section, Container, Badge, FaqList, HelpContacts
│   │   ├── layout/                 # Header (with no-JS nav), MobileMenu (<dialog>), Footer, SEO
│   │   └── islands/                # EnquiryForm (React, contact page only)
│   ├── content/                    # SINGLE SOURCE OF TRUTH for copy and business facts
│   │   ├── site.ts                 # business details, NAV, FOOTER, TEAM, PLACEHOLDERS, BRAND_COLORS
│   │   ├── pages.ts                # per-page SEO title and description
│   │   ├── services.ts, faqs.ts, values.ts, forms.ts
│   ├── layouts/BaseLayout.astro    # html shell, icons, font preloads, skip link
│   ├── lib/submitEnquiry.ts        # validation, honeypot, POST with timeout, mailto fallback (+ tests)
│   ├── pages/                      # index, about, services, who-we-support, ndis-info, contact,
│   │                               # privacy, feedback, 404, site.webmanifest, robots.txt
│   └── styles/global.css           # @theme tokens and layered base styles
├── astro.config.mjs                # static output, clean URLs (build.format 'file'), sitemap
└── vercel.json                     # security headers, asset caching, docs-only build skip
```

## Content and placeholders

All business facts live in `src/content/`. Components never hard-code them (the build fails if they do).
`SITE.PLACEHOLDERS` in `src/content/site.ts` is the live list of what still needs client input:

| Item | Current state |
|---|---|
| Phone | `0401 712 914`. The business plan lists `0413 955 269`; the client must confirm which is public |
| Email | Moving to `info@empowerwellsupport.com.au` once Zoho Mail is live (the old `empowerwell.com.au` belongs to another company) |
| Domain | `empowerwellsupport.com.au` (`www` redirects to it; `empowerwell-website.vercel.app` redirects to it) |
| Form endpoint | `PUBLIC_FORM_ENDPOINT` unset; the form falls back to a pre-filled email |
| Address | Suburb only (Dharruk NSW 2770) until the client approves the street address |
| Social links | `null` (hidden) until supplied |
| Photography and director photos | Illustrated SVG placeholders in `public/images/` |

To change the logo, replace `src/assets/brand/logo-source.png` and run `npm run brand-assets`.

## Brand tokens (Tailwind v4 `@theme`)

Defined once in `src/styles/global.css`:

| Token | Value | Use |
|---|---|---|
| `green-900` | `#00613A` | Wordmark, primary buttons |
| `purple-700` | `#622072` | Headings, links, focus ring |
| `green-500` | `#3AB04A` | Decorative only (icons, dividers), never body text |
| `lime-400` | `#8BC53F` | Badges and highlights; text on it is always `ink` |
| `surface` / `surface-tint` | `#FAFAF7` / `#F2F7EF` | Page and alternating section backgrounds |
| `ink` / `muted` | `#1F2A24` / `#5B6660` | Body and secondary text |

Cards use `rounded-[12px]`, buttons `rounded-full`, shadows `shadow-soft`.

## Accessibility (WCAG 2.2 AA)

- Contrast at least 4.5:1 for text (3:1 for large headings), verified with axe-core on every page.
- 3px focus rings on every control: purple on light backgrounds, lime on the dark footer.
- Skip link, semantic landmarks, 44px minimum tap targets, `prefers-reduced-motion` respected.
- Works without JavaScript: static HTML, a `<noscript>` navigation, a native `<details>` FAQ, and a form that posts by email instead of failing.
- No horizontal scrolling from 320px (400% zoom) to 2560px.

## Deployment

Vercel, static output from `dist/`. `vercel.json` sets HSTS, `nosniff`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, immutable caching for `/_astro/*`, and skips builds for docs-only commits. Set `PUBLIC_FORM_ENDPOINT` in the Vercel project before launch. `*.vercel.app` hosts send `X-Robots-Tag: noindex` so only the custom domain is indexed.

### Domain and DNS

| Host | Record (Cloudflare, **DNS only**) | Behaviour |
|---|---|---|
| `empowerwellsupport.com.au` | A `216.150.1.1`, A `216.150.16.1` | Production site; Let's Encrypt certificate issued and renewed by Vercel |
| `www.empowerwellsupport.com.au` | CNAME `d10dbf4790a9ed68.vercel-dns-016.com` | 308 redirect to the apex (Vercel project domain setting) |
| `empowerwell-website.vercel.app` | (Vercel) | 308 redirect to the apex (Vercel project domain setting) |

Keep the Cloudflare records **DNS only** (grey cloud): proxying through Cloudflare would put a second CDN and TLS layer in front of Vercel and interfere with certificate renewal. The canonical origin comes from `VERCEL_PROJECT_PRODUCTION_URL` (see `site-url.mjs`), so a redeploy is needed after any domain change.

## Licence

Proprietary. See [`LICENSE`](LICENSE). Copyright © 2026 Algorythmos Pty Ltd.
