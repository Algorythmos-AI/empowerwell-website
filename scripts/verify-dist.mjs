/**
 * Post-build verification of the spec in CLAUDE.md. Fails (exit 1) on any violation.
 *
 * Built HTML (dist/**.html):
 *   - exactly one <title>, meta description, og:title/description/url/image per page
 *   - titles and descriptions unique across pages
 *   - canonical present, absolute, on the production origin and matching the file's clean path
 *     (404 must be noindex with no canonical; no other page may be noindex)
 *   - JSON-LD parses
 *   - no Google Fonts, no remote images, no href="#", no internal links/assets that 404
 *   - every <img> has alt, width and height
 *   - no leftover dummy contact details
 * Source (src/):
 *   - no raw hex colours in components/pages/layouts (tokens live in src/styles/global.css;
 *     BRAND_COLORS in src/content/site.ts is the single allowed exception)
 *   - no hard-coded phone numbers, emails, ABN or NDIS registration outside src/content/
 */
import fs from "node:fs";
import path from "node:path";
import { parse } from "node-html-parser";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const dist = path.join(root, "dist");
const { resolveSiteUrl } = await import(new URL("../site-url.mjs", import.meta.url).href);
const ORIGIN = resolveSiteUrl();

const errors = [];
const warnings = [];
const fail = (file, msg) => errors.push(`${path.relative(root, file)}: ${msg}`);

function walk(dir, filter) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p, filter) : filter(p) ? [p] : [];
  });
}

if (!fs.existsSync(dist)) {
  console.error("dist/ not found. Run `npm run build` first.");
  process.exit(1);
}

// ---------- Built HTML ----------
const pages = walk(dist, (p) => p.endsWith(".html"));
const seen = { title: new Map(), description: new Map() };

function resolvesInDist(urlPath) {
  const clean = decodeURIComponent(urlPath.split(/[?#]/)[0]);
  if (clean === "/" || clean === "") return fs.existsSync(path.join(dist, "index.html"));
  const target = path.join(dist, clean);
  return (
    (fs.existsSync(target) && fs.statSync(target).isFile()) ||
    fs.existsSync(`${target}.html`) ||
    fs.existsSync(path.join(target, "index.html"))
  );
}

for (const file of pages) {
  const html = fs.readFileSync(file, "utf8");
  const doc = parse(html);
  const rel = "/" + path.relative(dist, file).replace(/\\/g, "/");
  const cleanPath = rel === "/index.html" ? "/" : rel.replace(/\.html$/, "").replace(/\/index$/, "");
  const is404 = rel === "/404.html";

  const one = (selector, label) => {
    const nodes = doc.querySelectorAll(selector);
    if (nodes.length !== 1) fail(file, `expected exactly 1 ${label}, found ${nodes.length}`);
    return nodes[0];
  };

  const title = one("title", "<title>")?.text.trim();
  const description = one('meta[name="description"]', "meta description")?.getAttribute("content")?.trim();
  for (const prop of ["og:title", "og:description", "og:url", "og:image"]) one(`meta[property="${prop}"]`, prop);

  for (const [key, value] of [["title", title], ["description", description]]) {
    if (!value) {
      fail(file, `empty ${key}`);
      continue;
    }
    if (seen[key].has(value)) fail(file, `duplicate ${key} (also on ${seen[key].get(value)}): "${value}"`);
    else seen[key].set(value, rel);
  }
  if (title && title.length > 65) warnings.push(`${rel}: title is ${title.length} chars (aim for <= 60)`);
  if (description && (description.length < 70 || description.length > 165))
    warnings.push(`${rel}: description is ${description.length} chars (aim for 110-160)`);

  const robots = doc.querySelector('meta[name="robots"]')?.getAttribute("content") ?? "";
  const canonical = doc.querySelectorAll('link[rel="canonical"]');
  if (is404) {
    if (!/noindex/.test(robots)) fail(file, "404 page must be noindex");
    if (canonical.length) fail(file, "404 page must not have a canonical");
  } else {
    if (/noindex/.test(robots)) fail(file, "page is noindex");
    if (canonical.length !== 1) fail(file, `expected exactly 1 canonical, found ${canonical.length}`);
    else {
      const href = canonical[0].getAttribute("href") ?? "";
      const expected = new URL(cleanPath, ORIGIN).href;
      if (href !== expected) fail(file, `canonical "${href}" should be "${expected}"`);
      const ogUrl = doc.querySelector('meta[property="og:url"]')?.getAttribute("content");
      if (ogUrl !== href) fail(file, `og:url "${ogUrl}" does not match canonical`);
    }
  }

  const ogImage = doc.querySelector('meta[property="og:image"]')?.getAttribute("content") ?? "";
  if (!ogImage.startsWith(`${ORIGIN}/`)) fail(file, `og:image must be absolute on ${ORIGIN}: "${ogImage}"`);
  else if (!resolvesInDist(new URL(ogImage).pathname)) fail(file, `og:image file missing: ${ogImage}`);

  for (const s of doc.querySelectorAll('script[type="application/ld+json"]')) {
    try {
      JSON.parse(s.text);
    } catch (e) {
      fail(file, `invalid JSON-LD: ${e.message}`);
    }
  }

  if (/fonts\.(googleapis|gstatic)\.com/.test(html)) fail(file, "references Google Fonts (fonts must be self-hosted)");
  if (/https?:\/\/[^"'\s)]*(unsplash|picsum|placehold|placeholder\.com|loremflickr|pravatar|dummyimage)/i.test(html))
    fail(file, "references a remote placeholder image service");
  if (/9831\s?0000|0400\s?000\s?000|0298310000/.test(html)) fail(file, "contains a dummy phone number");
  // empowerwell.com.au belongs to another company: never send visitors or enquiries there.
  if (/empowerwell\.com\.au/i.test(html)) fail(file, "references empowerwell.com.au, a domain owned by another company");
  if (/\bTODO\b|Note for Directors|lorem ipsum/i.test(doc.querySelector("body")?.text ?? "")) fail(file, "visible TODO / placeholder note in page text");
  if (/action="mailto:/i.test(html)) fail(file, "form posts to mailto: (insecure; browsers flag it)");

  for (const img of doc.querySelectorAll("img")) {
    const src = img.getAttribute("src") ?? "";
    if (!img.hasAttribute("alt")) fail(file, `<img src="${src}"> has no alt attribute`);
    if (!img.getAttribute("width") || !img.getAttribute("height")) fail(file, `<img src="${src}"> needs width and height`);
    if (/^https?:\/\//.test(src)) fail(file, `remote image "${src}"`);
  }

  for (const el of doc.querySelectorAll("[href], [src]")) {
    for (const attr of ["href", "src"]) {
      const value = el.getAttribute(attr);
      if (value == null) continue;
      if (value === "#" || value === "") fail(file, `empty or "#" ${attr} on <${el.rawTagName}>`);
      if (value.startsWith("/") && !value.startsWith("//") && !resolvesInDist(value))
        fail(file, `broken internal ${attr}: ${value}`);
      if (value.startsWith("#") && value.length > 1 && !doc.getElementById(value.slice(1)))
        fail(file, `in-page link to missing #${value.slice(1)}`);
    }
  }
}

if (pages.length === 0) errors.push("dist/ has no HTML pages");

// ---------- SVG assets ----------
// Browsers refuse to render an SVG with an unescaped "&" or other malformed markup.
for (const file of walk(dist, (p) => p.endsWith(".svg"))) {
  const svg = fs.readFileSync(file, "utf8");
  if (/&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)/.test(svg)) fail(file, "unescaped & in SVG (use &amp;)");
  if (!/<svg[\s>]/.test(svg) || !/<\/svg>\s*$/.test(svg)) fail(file, "SVG is not a single well-formed <svg> document");
}

// ---------- Source rules ----------
const src = path.join(root, "src");
const sourceFiles = walk(src, (p) => /\.(astro|tsx|ts)$/.test(p) && !p.endsWith(".test.ts"));
const isContent = (p) => p.startsWith(path.join(src, "content") + path.sep);

for (const file of sourceFiles) {
  const text = fs.readFileSync(file, "utf8");
  const stripped = text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  if (!isContent(file)) {
    const hex = stripped.match(/(?<![\w&/-])#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?(?:[0-9a-fA-F]{2})?\b(?![\w-])/g);
    if (hex) fail(file, `raw hex colour(s) ${[...new Set(hex)].join(", ")}: use @theme tokens`);
    if (/\b0[2-478](?:\s?\d){8}\b|\b04\d{2}\s\d{3}\s\d{3}\b|\b1[38]00\s?\d{3}\s?\d{3}\b/.test(stripped))
      fail(file, "hard-coded phone number: move it to src/content/site.ts");
    if (/[\w.+-]+@[\w-]+\.(com|org|net)(\.au)?\b/.test(stripped)) {
      const emails = stripped.match(/[\w.+-]+@[\w-]+\.[\w.]+/g).filter((e) => !/example\.com/.test(e));
      if (emails.length) fail(file, `hard-coded email ${emails.join(", ")}: move it to src/content/site.ts`);
    }
    if (/88 681 094 342|4-LCYP0SK/.test(stripped)) fail(file, "hard-coded ABN / NDIS registration: use SITE");
  }
}

// ---------- Environment ----------
if (!process.env.PUBLIC_FORM_ENDPOINT) {
  warnings.push("PUBLIC_FORM_ENDPOINT is not set: the enquiry form will fall back to a pre-filled email.");
}

for (const w of warnings) console.warn(`warn  ${w}`);
if (errors.length) {
  for (const e of errors) console.error(`error ${e}`);
  console.error(`\nverify-dist: ${errors.length} error(s) across ${pages.length} page(s).`);
  process.exit(1);
}
console.log(`verify-dist: ${pages.length} pages and ${sourceFiles.length} source files passed.`);
