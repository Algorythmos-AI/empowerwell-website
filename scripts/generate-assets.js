import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

// Ensure public directories exist
fs.mkdirSync('public/images', { recursive: true });

/**
 * Minimal pure-JS PNG encoder using node's zlib.deflateSync
 */
function createPng(width, height, getPixelRgba) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8 bits per channel
  ihdrData[9] = 6; // RGBA color type
  ihdrData[10] = 0; // Deflate
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // No interlace

  const ihdrChunk = createChunk('IHDR', ihdrData);

  // Scanlines with filter byte 0 (None)
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowSize);

  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter 0
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixelRgba(x, y, width, height);
      rawData[offset++] = r;
      rawData[offset++] = g;
      rawData[offset++] = b;
      rawData[offset++] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressedData);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = data.length;
  const chunk = Buffer.alloc(12 + length);
  chunk.writeUInt32BE(length, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);

  const crc = crc32(chunk.subarray(4, 8 + length));
  chunk.writeUInt32BE(crc, 8 + length);
  return chunk;
}

// CRC32 table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// 1. Generate public/logo.png (500x500)
console.log('Generating public/logo.png...');
const logoPng = createPng(500, 500, (x, y, w, h) => {
  // Brand colors: green-900 #00613A, purple-700 #622072, green-500 #3AB04A, lime-400 #8BC53F, surface #FAFAF7
  const cx = w / 2;
  const cy = h / 2 - 30;
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Background is transparent
  // Outer circular emblem ring in brand green
  if (dist >= 140 && dist <= 170) {
    // Purple swoosh arc on top-left to bottom-right
    if (dy > -dx * 0.8) {
      return [0x62, 0x20, 0x72, 255]; // purple-700
    }
    return [0x00, 0x61, 0x3A, 255]; // green-900
  }

  // Inner leaf / heart shapes
  const leaf1Dist = Math.sqrt(Math.pow(x - (cx - 35), 2) + Math.pow(y - (cy - 10), 2));
  if (leaf1Dist < 60 && dx < 0) {
    return [0x3A, 0xB0, 0x4A, 255]; // green-500
  }

  const leaf2Dist = Math.sqrt(Math.pow(x - (cx + 35), 2) + Math.pow(y - (cy - 20), 2));
  if (leaf2Dist < 55 && dx > 0) {
    return [0x8B, 0xC5, 0x3F, 255]; // lime-400
  }

  // Central supportive hands/swoosh mark
  const centerDist = Math.sqrt(Math.pow(x - cx, 2) + Math.pow(y - (cy + 25), 2));
  if (centerDist < 45 && dy > 0) {
    return [0x62, 0x20, 0x72, 255]; // purple-700
  }

  // Bottom wordmark block representation
  if (y >= 380 && y <= 405 && x >= 80 && x <= 420) {
    return [0x00, 0x61, 0x3A, 255]; // green-900
  }
  if (y >= 415 && y <= 430 && x >= 120 && x <= 380) {
    return [0x62, 0x20, 0x72, 255]; // purple-700
  }

  return [0, 0, 0, 0];
});
fs.writeFileSync('public/logo.png', logoPng);

// 2. Generate public/og-image.png (1200x630, logo on surface-tint #F2F7EF)
console.log('Generating public/og-image.png...');
const ogPng = createPng(1200, 630, (x, y, _w, _h) => {
  // Surface tint background: #F2F7EF
  let r = 0xF2;
  let g = 0xF7;
  let b = 0xEF;

  // Left decorative card boundary
  if (x >= 40 && x <= 1160 && y >= 40 && y <= 590) {
    if (x === 40 || x === 1160 || y === 40 || y === 590) {
      return [0x00, 0x61, 0x3A, 255]; // green border
    }
    // Inner surface
    r = 0xFA;
    g = 0xFA;
    b = 0xF7;
  }

  // Brand emblem on left (center: 260, 315)
  const emblemCx = 260;
  const emblemCy = 315;
  const edx = x - emblemCx;
  const edy = y - emblemCy;
  const edist = Math.sqrt(edx * edx + edy * edy);

  if (edist >= 110 && edist <= 135) {
    return (edy > -edx * 0.7) ? [0x62, 0x20, 0x72, 255] : [0x00, 0x61, 0x3A, 255];
  }
  if (edist < 85 && edx < 0 && edy < 20) {
    return [0x3A, 0xB0, 0x4A, 255]; // green-500
  }
  if (edist < 80 && edx > 0 && edy < 10) {
    return [0x8B, 0xC5, 0x3F, 255]; // lime-400
  }
  if (edist < 65 && edy > 10) {
    return [0x62, 0x20, 0x72, 255]; // purple-700
  }

  // Right side typography stripes (headline & badges)
  // Header bar (Empowerwell Support)
  if (x >= 460 && x <= 1080 && y >= 190 && y <= 240) {
    return [0x00, 0x61, 0x3A, 255]; // green-900
  }
  // Tagline (Empowering You to Thrive)
  if (x >= 460 && x <= 950 && y >= 265 && y <= 295) {
    return [0x62, 0x20, 0x72, 255]; // purple-700
  }
  // Trust bar badge (Registered NDIS Provider · Western Sydney)
  if (x >= 460 && x <= 1020 && y >= 340 && y <= 375) {
    return [0x3A, 0xB0, 0x4A, 255]; // green-500
  }
  // Contact phone bar
  if (x >= 460 && x <= 780 && y >= 415 && y <= 445) {
    return [0x1F, 0x2A, 0x24, 255]; // ink
  }

  return [r, g, b, 255];
});
fs.writeFileSync('public/og-image.png', ogPng);

// 3. Generate public/favicon.svg
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#00613A"/>
  <circle cx="32" cy="32" r="22" fill="none" stroke="#622072" stroke-width="4"/>
  <path d="M22 36C22 26 32 20 32 20C32 20 42 26 42 36C42 42 37 46 32 46C27 46 22 42 22 36Z" fill="#3AB04A"/>
  <circle cx="32" cy="30" r="6" fill="#8BC53F"/>
</svg>`;
fs.writeFileSync('public/favicon.svg', faviconSvg);
fs.writeFileSync('public/favicon.ico', faviconSvg); // standard svg fallback

// 4. Generate public/logo.svg (vector version)
const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 120" fill="none">
  <g transform="translate(10, 10)">
    <circle cx="50" cy="50" r="46" stroke="#00613A" stroke-width="8"/>
    <path d="M30 60C30 42 50 30 50 30C50 30 70 42 70 60C70 72 61 78 50 78C39 78 30 72 30 60Z" fill="#3AB04A"/>
    <circle cx="50" cy="48" r="12" fill="#8BC53F"/>
    <path d="M22 68C32 82 68 82 78 68" stroke="#622072" stroke-width="6" stroke-linecap="round"/>
  </g>
  <text x="130" y="62" font-family="'Nunito', sans-serif" font-weight="800" font-size="44" fill="#00613A" letter-spacing="-0.5">Empowerwell</text>
  <text x="130" y="96" font-family="'Atkinson Hyperlegible', sans-serif" font-weight="700" font-size="20" fill="#622072" letter-spacing="1">SUPPORT PTY LTD</text>
  <text x="360" y="96" font-family="'Atkinson Hyperlegible', sans-serif" font-weight="700" font-size="14" fill="#3AB04A">NDIS 4-LCYP0SK</text>
</svg>`;
fs.writeFileSync('public/logo.svg', logoSvg);

// 5. Generate local SVG image placeholders with brand tints, descriptive labels, and TODO markers
const placeholderImages = [
  {
    filename: 'carer-and-participant-park.svg',
    title: 'Carer & Participant Park Walk',
    caption: 'TODO: Replace with licensed photo of carer and participant strolling in Western Sydney park',
    icon: 'park',
  },
  {
    filename: 'independent-living-support.svg',
    title: 'Supported Independent Living (SIL)',
    caption: 'TODO: Replace with licensed photo of participant in modern accessible home environment',
    icon: 'home',
  },
  {
    filename: 'personal-care-routine.svg',
    title: 'Personal Care & Daily Support',
    caption: 'TODO: Replace with licensed photo of compassionate morning routine assistance',
    icon: 'care',
  },
  {
    filename: 'community-activity-centre.svg',
    title: 'Community Participation Hub',
    caption: 'TODO: Replace with licensed photo of group activity and social crafts',
    icon: 'group',
  },
  {
    filename: 'skills-and-learning.svg',
    title: 'Life Skills & Cooking Coaching',
    caption: 'TODO: Replace with licensed photo of practical life skills coaching in kitchen',
    icon: 'skills',
  },
  {
    filename: 'transport-and-outings.svg',
    title: 'Accessible Transport & Travel',
    caption: 'TODO: Replace with licensed photo of travel training and accessible transport',
    icon: 'car',
  },
  {
    filename: 'team-aiwen-kuel.svg',
    title: 'Aiwen Kuel — Director',
    caption: 'TODO: Replace with professional headshot of Director Aiwen Kuel',
    icon: 'person',
  },
  {
    filename: 'team-lual-chol.svg',
    title: 'Lual Chol — Director',
    caption: 'TODO: Replace with professional headshot of Director Lual Chol',
    icon: 'person',
  },
];

for (const img of placeholderImages) {
  const isPortrait = img.filename.startsWith('team-');
  const width = isPortrait ? 400 : 800;
  const height = isPortrait ? 480 : 500;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F2F7EF"/>
      <stop offset="100%" stop-color="#E5EFE2"/>
    </linearGradient>
    <pattern id="patternDots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
      <circle cx="3" cy="3" r="1.5" fill="#3AB04A" opacity="0.15"/>
    </pattern>
  </defs>

  <!-- Background -->
  <rect width="${width}" height="${height}" fill="url(#bgGrad)"/>
  <rect width="${width}" height="${height}" fill="url(#patternDots)"/>

  <!-- Border -->
  <rect x="12" y="12" width="${width - 24}" height="${height - 24}" rx="16" fill="none" stroke="#00613A" stroke-width="2" stroke-opacity="0.3"/>

  <!-- Center Decorative Emblem -->
  <g transform="translate(${width / 2}, ${height * 0.4})">
    <circle r="${isPortrait ? 60 : 70}" fill="#00613A" opacity="0.08"/>
    <circle r="${isPortrait ? 46 : 54}" fill="#622072" opacity="0.12"/>
    <circle r="${isPortrait ? 30 : 36}" fill="#3AB04A" opacity="0.25"/>
    <!-- Central Icon Representation -->
    <path d="M-18 8 C-18 -12 0 -24 0 -24 C0 -24 18 -12 18 8 C18 18 10 24 0 24 C-10 24 -18 18 -18 8 Z" fill="#00613A"/>
    <circle cx="0" cy="-2" r="7" fill="#8BC53F"/>
  </g>

  <!-- Title -->
  <text x="${width / 2}" y="${height * 0.68}" text-anchor="middle" font-family="'Nunito', sans-serif" font-weight="800" font-size="${isPortrait ? 22 : 26}" fill="#00613A">${img.title}</text>
  
  <!-- Trust Note -->
  <text x="${width / 2}" y="${height * 0.76}" text-anchor="middle" font-family="'Atkinson Hyperlegible', sans-serif" font-weight="700" font-size="14" fill="#622072">Empowerwell Support · NDIS 4-LCYP0SK</text>

  <!-- TODO Marker (Accessible developer notification) -->
  <rect x="24" y="${height - 56}" width="${width - 48}" height="36" rx="8" fill="#FAFAF7" stroke="#8BC53F" stroke-width="1.5"/>
  <text x="${width / 2}" y="${height - 33}" text-anchor="middle" font-family="'Atkinson Hyperlegible', sans-serif" font-size="11" fill="#5B6660" font-weight="700">${img.caption}</text>
</svg>`;

  fs.writeFileSync(path.join('public/images', img.filename), svg);
}

// 6. Generate public/robots.txt
const robotsTxt = `User-agent: *
Allow: /

Sitemap: https://empowerwell.com.au/sitemap-index.xml
`;
fs.writeFileSync('public/robots.txt', robotsTxt);

console.log('All public assets successfully created!');
