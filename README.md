# Empowerwell Support Pty Ltd — Website Foundation

A production-grade, pre-rendered static website foundation for **Empowerwell Support Pty Ltd**, a registered NDIS provider located in Dharruk NSW 2770, servicing Western Sydney, Greater Sydney, and regional NSW.

Built with **Astro 5** (static output), **TypeScript (strict)**, **Tailwind CSS v4** (`@theme` tokens), **React interactive islands** (`@astrojs/react`), and self-hosted fonts. Engineered for strict **WCAG 2.2 AA** accessibility and fast local performance.

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start local development server (serves on http://localhost:3000)
npm run dev

# 3. Run full verification (Astro check + TypeScript lint + static build)
npm run check

# 4. Preview static production build
npm run preview
```

---

## Project Structure

```
├── public/
│   ├── favicon.svg & favicon.ico     # Brand favicon
│   ├── logo.svg & logo.png           # Master brand lockup
│   ├── og-image.png                  # 1200x630 OpenGraph social share card
│   ├── robots.txt                    # Search crawler policy
│   └── images/                       # Local branded SVG placeholders (TODO markers)
│       ├── carer-and-participant-park.svg
│       ├── independent-living-support.svg
│       ├── personal-care-routine.svg
│       ├── community-activity-centre.svg
│       ├── skills-and-learning.svg
│       ├── transport-and-outings.svg
│       ├── team-aiwen-kuel.svg
│       └── team-lual-chol.svg
├── src/
│   ├── components/
│   │   ├── ui/                       # Reusable token-based Astro primitives
│   │   │   ├── Button.astro          # Primary, secondary, outline, lime (>=44px tap target)
│   │   │   ├── Card.astro            # 12px radius, soft shadow, hairline borders
│   │   │   ├── Section.astro         # Surface, tint, green, purple section wrappers
│   │   │   ├── Container.astro       # Max-width layout container
│   │   │   ├── Badge.astro           # Brand badges (ink on lime, tint, purple)
│   │   │   ├── Input.astro           # Accessible input with inline errors
│   │   │   ├── Select.astro          # Accessible select dropdown
│   │   │   └── Textarea.astro        # Accessible multi-line textarea
│   │   ├── layout/
│   │   │   ├── Header.astro          # Sticky 3-zone top bar with tap-to-call button
│   │   │   ├── Footer.astro          # NDIS Reg, ABN, Acknowledgement of Country
│   │   │   └── SEO.astro             # Pre-rendered tags & LocalBusiness JSON-LD
│   │   └── islands/                  # React interactive islands (@astrojs/react)
│   │       ├── MobileMenu.tsx        # Keyboard-accessible slide-out menu
│   │       ├── FaqAccordion.tsx      # Semantic details/summary with smooth toggle
│   │       └── EnquiryForm.tsx       # Client-validated referral form + mailto fallback
│   ├── content/                      # SINGLE SOURCE OF TRUTH (ALL COPY LIVES HERE)
│   │   ├── site.ts                   # Master business facts, NDIS Reg, ABN, placeholders
│   │   ├── services.ts               # 11 core NDIS services & plain-English copy
│   │   ├── faqs.ts                   # NDIS FAQs & guidance
│   │   └── values.ts                 # Core ethical values
│   ├── layouts/
│   │   └── BaseLayout.astro          # Root HTML layout, skip link, self-hosted fonts
│   ├── lib/
│   │   └── submitEnquiry.ts          # Validation logic, honeypot, POST stub, mailto
│   ├── pages/                        # Pre-rendered multi-page routes
│   │   ├── index.astro               # Home (Hero, Trust bar, Highlights, Values, 3-Step)
│   │   ├── about.astro               # About (Story, Mission, Vision, Directors)
│   │   ├── services.astro            # Services (11 Cards + deep-link enquiry)
│   │   ├── who-we-support.astro      # Autism, ID, Ageing, Complex, Plan Types
│   │   ├── ndis-info.astro           # Plain-English FAQ accordion (no-JS resilient)
│   │   ├── contact.astro             # Referral Form, Phone, Email, Office Details
│   │   ├── privacy.astro             # Australian Privacy Principles notice
│   │   ├── feedback.astro            # Complaints procedure & NDIS Commission escalation
│   │   └── 404.astro                 # Recovery page
│   └── styles/
│       └── global.css                # Tailwind v4 @theme brand tokens & focus styles
├── astro.config.mjs                  # Astro 5 configuration + React + Sitemap
├── vercel.json                       # Vercel static deployment settings
├── CLAUDE.md                         # Engineering guidelines for Claude Code
└── package.json
```

---

## Master List of Placeholders to Replace

Every placeholder is centralized in `src/content/site.ts` for quick one-line updates:

| Placeholder Item | Current Value | How to Update |
| :--- | :--- | :--- |
| **Contact Phone** | `(02) 9831 0000` (Western Sydney local) / `0400 000 000` (DUMMY mobile) | Edit `SITE.phone` and `SITE.phoneHref` in `src/content/site.ts` |
| **Email Address** | `info@empowerwell.com.au` | Edit `SITE.email` and `SITE.emailHref` in `src/content/site.ts` |
| **Form Endpoint** | `PUBLIC_FORM_ENDPOINT` | Set `PUBLIC_FORM_ENDPOINT="https://formspree.io/f/..."` in `.env` |
| **Social Links** | `"#"` | Update `SITE.socials` in `src/content/site.ts` |
| **Director Photos** | `public/images/team-aiwen-kuel.svg` & `team-lual-chol.svg` | Drop official headshot photos into `public/images/` and update `TEAM` in `site.ts` |
| **Photography** | SVG placeholders in `public/images/` | Replace with licensed photos of participants and carers in community settings |
| **Director Story** | Draft narrative in `src/pages/about.astro` | Directors Aiwen & Lual can expand their personal journey in `about.astro` |
| **NDIS Commission Hotline** | `1800 035 544` | Verified current hotline in `src/pages/feedback.astro` |

---

## Brand Tokens (Tailwind v4 `@theme`)

Defined once in `src/styles/global.css`:
- `green-900`: `#00613A` (primary text, buttons, header; 7.6:1 contrast on white)
- `purple-700`: `#622072` (headings, links, focus ring; 10.2:1 contrast on surface)
- `green-500`: `#3AB04A` (decorative only: icons, dividers; never body text)
- `lime-400`: `#8BC53F` (decorative badges & highlights; text on it must always be ink)
- `surface`: `#FAFAF7` (soft white canvas)
- `surface-tint`: `#F2F7EF` (gentle green-tinted alternating sections)
- `ink`: `#1F2A24` (high-contrast primary text)
- `muted`: `#5B6660` (accessible secondary text, > 5.5:1 contrast)
- Card radius: `12px` (`rounded-[12px]`)
- Button radius: `9999px` (`rounded-full`)

---

## Accessibility Compliance (WCAG 2.2 AA)

- **Contrast**: Guaranteed $\ge 4.5:1$ on all body text and $\ge 3:1$ on large headings.
- **Focus Indicators**: High-visibility 3px purple focus rings (`focus-visible:outline-3 focus-visible:outline-purple-700`).
- **Skip to Content**: First tabbable element in the DOM skipping straight to `#main-content`.
- **Tap Targets**: All buttons, nav links, and interactive form controls are minimum 44px height/width.
- **No-JS Resilience**: All pages pre-render as static HTML with `<title>` and `<meta>` tags. The FAQ accordion is built on native `<details>` and `<summary>` tags, working completely without JavaScript.
- **Zoom**: Fully responsive and tested at 200% browser zoom without layout breakage.
- **Motion**: Strictly honors `prefers-reduced-motion` with gentle transitions.
