# CLAUDE.md — Empowerwell Support engineering guide

Strict conventions for this repository. They apply to every contributor, human or automated.
Org-wide rules (branching, commits, catalog) are in `Algorythmos-AI/.github-private/AGENTS.md`.

---

## 1. Stack and architecture
- **Framework**: Astro 7 (`output: 'static'`, `trailingSlash: 'never'`, `build.format: 'file'`). Node 24 (`.nvmrc`).
- **TypeScript**: strict mode (`tsconfig.json`).
- **Styling**: Tailwind CSS v4. Brand tokens under `@theme` in `src/styles/global.css`. Base element
  styles must stay inside `@layer base`, because unlayered CSS overrides every Tailwind utility.
- **JavaScript budget**: ship as little as possible.
  - `EnquiryForm.tsx` is the **only** React island (contact page only).
  - `MobileMenu.astro` is a native modal `<dialog>` with a few lines of script (top layer, inert page,
    Escape and focus return come from the browser).
  - FAQs (`FaqList.astro`) are native `<details>/<summary>` with no JavaScript.
  - Prefer HTML/CSS and small `<script>` blocks over new islands.
- **Deployment**: Vercel (static) via `vercel.json`.

---

## 2. Core non-negotiable rules

### A. Copy lives in `src/content/`
- **Never hard-code copy, phone numbers, emails, addresses, registration numbers, nav links or SEO
  metadata in components.**
- Sources of truth:
  - `src/content/site.ts`: business details, contact info, ABN, NDIS registration, `NAV`, `FOOTER`,
    `TEAM`, `PLACEHOLDERS`, `BRAND_COLORS`
  - `src/content/pages.ts`: every page's `title` and `description` (unique, title ≤ 60 chars)
  - `src/content/services.ts`, `faqs.ts`, `values.ts`, `forms.ts`
  - `HELP_CONTACTS` in `site.ts` (000, abuse hotline, NDIS Commission, TIS, NRS) via `HelpContacts.astro`
- **Never publish claims the client hasn't confirmed**: response times, capacity, staff roles or
  qualifications, vehicles, housing, suburbs, guarantees, testimonials or superlatives. The client's
  brief (`../Reference/Empowerwell_Website_Brief.md`, outside the repo) is the source of truth.
- `scripts/verify-dist.mjs` fails the build on hard-coded phone numbers, emails, ABN or NDIS
  registration outside `src/content/`.

### B. Tokens only, never raw hex
- **No raw hex in `.astro`, `.tsx` or `.ts` outside `src/content/`.** The only hex values allowed
  are the `@theme` tokens in `global.css` and `BRAND_COLORS` in `site.ts` (for `theme-color` and the
  web manifest, which can't use CSS variables). The build enforces this.
- Use the Tailwind classes mapped to brand tokens:
  - `text-green-900` / `bg-green-900`: wordmark, primary buttons
  - `text-purple-700` / `bg-purple-700`: headings, links, focus ring
  - `text-green-500` / `bg-green-500`: decorative accents only, never body text
  - `bg-lime-400`: badges and highlights only, with `text-ink`
  - `bg-surface`, `bg-surface-tint`, `text-ink`, `text-muted`
- Button radius `rounded-full`, card radius `rounded-[12px]`, shadows `shadow-soft` only.

### C. WCAG 2.2 AA required
- Text contrast ≥ 4.5:1 (large headings ≥ 3:1).
- Visible 3px focus ring on every interactive control:
  `focus-visible:outline-3 focus-visible:outline-purple-700 focus-visible:outline-offset-2`.
  **The one exception**: on the dark green footer, use `focus-visible:outline-lime-400`, because purple
  fails 3:1 against it.
- Skip link (`.skip-link`) stays first in the DOM.
- Tap targets ≥ 44px in both dimensions.
- Semantic landmarks (`<header>`, `<main id="main-content">`, `<footer>`, labelled `<nav>`s).
- Every image has meaningful `alt` text (or `alt=""` when decorative), plus `width` and `height`.
- Must work at 400% zoom (320px wide) and **without JavaScript**: the `<noscript>` nav in
  `Header.astro`, `js-only` on JS-dependent controls. The enquiry form POSTs to the endpoint when one
  is set (never a GET, which would put personal details in the URL); without an endpoint it is
  `js-only` and the page's `<noscript>` gives phone and email. Never use a `mailto:` form action.
- Minimum text size is 15px (`text-xs` is redefined in `@theme`); body copy is `text-base` or larger.
- Plain English for people with intellectual disability: short sentences, everyday words, explain
  NDIS terms the first time they appear. Australian spelling.
- `role="list"` on styled `<ul>`s is intentional (it restores list semantics in Safari/VoiceOver).

### D. Run `npm run check` before committing
```bash
npm run check
```
This runs `astro check`, `tsc --noEmit`, ESLint (TypeScript, Astro, `jsx-a11y`, React hooks), Vitest,
`astro build`, then `scripts/verify-dist.mjs`. Zero errors permitted.

### E. Enquiries must never claim to be sent when they were not
`submitEnquiry()` returns `delivery: "sent"` only when the configured endpoint returns 2xx. Any other
outcome falls back to a pre-filled email, and the UI must say it has not been sent yet.

---

## 3. Placeholders registry
`SITE.PLACEHOLDERS` in `src/content/site.ts` is the authoritative list. Summary:
- `SITE.phone`: `0401 712 914` (client to confirm against `0413 955 269` from the business plan)
- `SITE.email`: `info@empowerwell.com.au` (domain and Zoho Mail not set up yet)
- `PUBLIC_FORM_ENDPOINT`: set in Vercel (Formspree / Web3Forms)
- `SITE.socials`: `null` until supplied (hidden while null)
- Photography and director photos: SVG placeholders in `public/images/`
- Logo: `src/assets/brand/logo-source.png` (500×500 PNG). Regenerate derived assets with
  `npm run brand-assets` after any change (for example the planned vector rebuild).

## 4. Commits and pull requests
Follow the org rule (D-016): branch from `main`, open a PR, no `Co-Authored-By` trailers and no
mention of AI tools in commits, PR text or READMEs. Author: `skalaliya <skalaliya@gmail.com>`.
