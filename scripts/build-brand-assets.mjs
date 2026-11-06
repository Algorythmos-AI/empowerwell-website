/**
 * Builds every logo-derived asset from the single client-supplied source file.
 *
 *   src/assets/brand/logo-source.png   (500×500 PNG on an opaque white background, as supplied)
 *
 * Outputs (all committed, so builds never depend on this script):
 *   src/assets/brand/logo-full.png     trimmed lockup (tree + wordmark + tagline), transparent
 *   src/assets/brand/emblem.png        trimmed tree emblem only, transparent (header / footer)
 *   public/logo.png                    full lockup, transparent, for JSON-LD and sharing
 *   public/favicon.ico                 16/32/48 px, PNG-in-ICO
 *   public/favicon-32.png, favicon-16.png, apple-touch-icon.png (180), icon-192.png, icon-512.png
 *   public/og-image.png                1200×630 social card
 *
 * Run: npm run brand-assets   (re-run whenever the source logo changes, e.g. after the vector rebuild)
 */
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const SRC = path.join(root, "src/assets/brand/logo-source.png");
const out = (p) => path.join(root, p);

// Brand surface-tint token (--color-surface-tint) used behind the social card.
const SURFACE_TINT = { r: 0xf2, g: 0xf7, b: 0xef, alpha: 1 };
const WHITE = { r: 255, g: 255, b: 255, alpha: 1 };
// The wordmark starts below this row in the 500×500 source; everything above is the tree emblem.
const EMBLEM_BOTTOM = 335;

/** Key out the white background, un-premultiplying anti-aliased edges so they stay crisp on any colour. */
async function removeWhite(input) {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const a = (255 - Math.min(r, g, b)) / 255; // distance from white
    if (a < 0.02) {
      data[i + 3] = 0;
      continue;
    }
    const alpha = Math.min(1, a * 1.15);
    data[i] = clamp((r - 255 * (1 - alpha)) / alpha);
    data[i + 1] = clamp((g - 255 * (1 - alpha)) / alpha);
    data[i + 2] = clamp((b - 255 * (1 - alpha)) / alpha);
    data[i + 3] = Math.round(alpha * 255);
  }
  return sharp(data, { raw: info }).png().toBuffer();
}
const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));

const trim = (buf) => sharp(buf).trim({ threshold: 1 }).png().toBuffer();

/** Square icon: emblem centred on a background with padding. */
async function squareIcon(emblem, size, background, padRatio = 0.1) {
  const inner = Math.round(size * (1 - padRatio * 2));
  const resized = await sharp(emblem)
    .resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background } })
    .composite([{ input: resized, gravity: "center" }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

/** ICO container holding PNG images (supported by every current browser and Windows Vista+). */
function buildIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  const dir = Buffer.alloc(16 * images.length);
  let offset = 6 + dir.length;
  images.forEach(({ size, data }, i) => {
    const e = i * 16;
    dir.writeUInt8(size >= 256 ? 0 : size, e);
    dir.writeUInt8(size >= 256 ? 0 : size, e + 1);
    dir.writeUInt8(0, e + 2);
    dir.writeUInt8(0, e + 3);
    dir.writeUInt16LE(1, e + 4);
    dir.writeUInt16LE(32, e + 6);
    dir.writeUInt32LE(data.length, e + 8);
    dir.writeUInt32LE(offset, e + 12);
    offset += data.length;
  });
  return Buffer.concat([header, dir, ...images.map((i) => i.data)]);
}

async function main() {
  const source = await fs.readFile(SRC);
  const meta = await sharp(source).metadata();
  if (meta.width !== 500 || meta.height !== 500) {
    throw new Error(`Expected a 500×500 source logo, got ${meta.width}×${meta.height}. Update EMBLEM_BOTTOM.`);
  }

  const transparent = await removeWhite(source);
  const full = await trim(transparent);
  const emblemCrop = await sharp(transparent)
    .extract({ left: 0, top: 0, width: 500, height: EMBLEM_BOTTOM })
    .png()
    .toBuffer();
  const emblem = await trim(emblemCrop);

  await fs.writeFile(out("src/assets/brand/logo-full.png"), full);
  await fs.writeFile(out("src/assets/brand/emblem.png"), emblem);
  await fs.writeFile(out("public/logo.png"), full);

  const transparentBg = { r: 0, g: 0, b: 0, alpha: 0 };
  const ico = await Promise.all([16, 32, 48].map(async (size) => ({ size, data: await squareIcon(emblem, size, transparentBg, 0.02) })));
  await fs.writeFile(out("public/favicon.ico"), buildIco(ico));
  await fs.writeFile(out("public/favicon-16.png"), ico[0].data);
  await fs.writeFile(out("public/favicon-32.png"), ico[1].data);
  await fs.writeFile(out("public/apple-touch-icon.png"), await squareIcon(emblem, 180, WHITE, 0.1));
  await fs.writeFile(out("public/icon-192.png"), await squareIcon(emblem, 192, WHITE, 0.1));
  await fs.writeFile(out("public/icon-512.png"), await squareIcon(emblem, 512, WHITE, 0.1));

  const card = await sharp(full).resize({ height: 470, fit: "inside" }).toBuffer();
  await sharp({ create: { width: 1200, height: 630, channels: 4, background: SURFACE_TINT } })
    .composite([{ input: card, gravity: "center" }])
    .flatten({ background: SURFACE_TINT })
    .png({ compressionLevel: 9, palette: true, quality: 90 })
    .toFile(out("public/og-image.png"));

  console.log("Brand assets written.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
