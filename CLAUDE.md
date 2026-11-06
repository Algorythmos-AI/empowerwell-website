# CLAUDE.md — Empowerwell Support Engineering Guide

This document defines the strict development conventions for Empowerwell Support Pty Ltd. All future development in Claude Code must adhere to these rules.

---

## 1. Stack & Architecture
- **Framework**: Astro 5 (`output: 'static'`)
- **TypeScript**: Strict mode enabled in `tsconfig.json`
- **Styling**: Tailwind CSS v4 with brand tokens configured under `@theme` in `src/styles/global.css`
- **Interactive Islands**: React (`@astrojs/react`) used **strictly** for stateful components:
  - `MobileMenu.tsx` (mobile slide-out navigation)
  - `FaqAccordion.tsx` (semantic `<details>/<summary>` with JS animation)
  - `EnquiryForm.tsx` (validated referral form)
- **Deployment**: Vercel (static) via `vercel.json`

---

## 2. Core Non-Negotiable Rules

### A. "Copy Lives in src/content/"
- **Never hardcode copy, phone numbers, emails, addresses, or registration numbers in components.**
- All business details and placeholders live in:
  - `src/content/site.ts` (business details, contact info, ABN, NDIS Reg, placeholders)
  - `src/content/services.ts` (11 core NDIS service definitions)
  - `src/content/faqs.ts` (NDIS guidance & accordion Q&As)
  - `src/content/values.ts` (core ethical values)
- To update content, edit the corresponding content module.

### B. "Tokens Only, Never Raw Hex"
- **Never write raw hex codes (`#00613A`, `#622072`, etc.) in `.astro` or `.tsx` components.**
- Use Tailwind classes mapped to brand tokens:
  - `text-green-900` / `bg-green-900` (primary wordmark, primary buttons; 7.6:1 contrast on white)
  - `text-purple-700` / `bg-purple-700` (headings, links, focus ring; 10.2:1 contrast on surface)
  - `text-green-500` / `bg-green-500` (decorative accents, icons, dividers only; never body text)
  - `bg-lime-400` (badges & highlights only; text on it must always be `text-ink`)
  - `bg-surface` (`#FAFAF7`), `bg-surface-tint` (`#F2F7EF`), `text-ink` (`#1F2A24`), `text-muted` (`#5B6660`)
- Button radius: `rounded-full` (9999px). Card radius: `rounded-[12px]`. Shadows: `shadow-soft` only.

### C. "WCAG 2.2 AA Contrast Required"
- Text contrast $\ge 4.5:1$ (large headings $\ge 3:1$).
- Visible 3px purple focus outline on all interactive controls (`focus-visible:outline-3 focus-visible:outline-purple-700 focus-visible:outline-offset-2`).
- Skip to content link (`.skip-link`) must be maintained at the top of DOM.
- Interactive tap targets must be $\ge 44\text{px}$ in height/width.
- Semantic HTML landmarks (`<header>`, `<main id="main-content">`, `<footer>`, `<section aria-label="...">`).
- Every image must include descriptive `alt` text.
- Must function smoothly at 200% browser zoom and without JavaScript (apart from form submit).

### D. "Run npm run check Before Committing"
Before making any git commit, run:
```bash
npm run check
```
This executes `astro check`, TypeScript linting (`tsc --noEmit`), and full static build (`astro build`). Zero errors permitted.

---

## 3. Placeholders Registry
All placeholders are centralized in `src/content/site.ts` and can be swapped in one line:
- `SITE.phone`: `(02) 9831 0000` (Local Sydney) / `0400 000 000` (Mobile placeholder)
- `SITE.email`: `info@empowerwell.com.au`
- `SITE.formEndpoint`: Set `PUBLIC_FORM_ENDPOINT` in `.env`
- Photography: SVG placeholders in `public/images/` ready for licensed photography swap
