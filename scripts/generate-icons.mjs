#!/usr/bin/env node
// Generiert PWA-Icons (192x192, 512x512, maskable 512x512)
// und ein OG-Default-Bild aus dem Logo-SVG.

import sharp from 'sharp';
import { readFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const iconsDir = resolve(root, 'static/icons');
mkdirSync(iconsDir, { recursive: true });

const svg = readFileSync(resolve(root, 'static/favicon.svg'));

const targets = [
  { size: 192, name: 'icon-192.png', maskable: false },
  { size: 512, name: 'icon-512.png', maskable: false },
  { size: 512, name: 'icon-maskable-512.png', maskable: true },
  { size: 180, name: 'apple-touch-icon.png', maskable: false }
];

// Pergament-Hintergrund (passt zum SVG); für maskable Icons brauchen wir
// Sicherheits-Padding, weil Android-Launcher das Logo beschneiden.
const bg = { r: 251, g: 243, b: 227, alpha: 1 };

for (const target of targets) {
  if (target.maskable) {
    // Maskable: Logo bei 60% Größe mit Hintergrund-Padding (Safe-Zone-Regel).
    const logoSize = Math.round(target.size * 0.6);
    const offset = Math.round((target.size - logoSize) / 2);
    const logo = await sharp(svg, { density: 512 })
      .resize(logoSize, logoSize)
      .png()
      .toBuffer();
    await sharp({
      create: {
        width: target.size,
        height: target.size,
        channels: 4,
        background: bg
      }
    })
      .composite([{ input: logo, top: offset, left: offset }])
      .png({ quality: 90, compressionLevel: 9 })
      .toFile(resolve(iconsDir, target.name));
  } else {
    await sharp(svg, { density: 512 })
      .resize(target.size, target.size, {
        fit: 'contain',
        background: bg
      })
      .png({ quality: 90, compressionLevel: 9 })
      .toFile(resolve(iconsDir, target.name));
  }
  console.log(`✔ ${target.name} (${target.size}×${target.size})`);
}

// Auch ein 32x32 Favicon-PNG als Fallback für ältere Browser/Tab-Anzeigen.
await sharp(svg, { density: 512 })
  .resize(32, 32, { fit: 'contain', background: bg })
  .png()
  .toFile(resolve(root, 'static/favicon.png'));
console.log('✔ favicon.png (32×32)');

// OG-Default-Bild 1200x630
const ogBg = await sharp({
  create: { width: 1200, height: 630, channels: 4, background: bg }
})
  .png()
  .toBuffer();

const ogLogo = await sharp(svg, { density: 512 }).resize(420, 420).png().toBuffer();

await sharp(ogBg)
  .composite([{ input: ogLogo, top: 105, left: 130 }])
  .png({ quality: 90 })
  .toFile(resolve(root, 'static/og-default.png'));
console.log('✔ og-default.png (1200×630)');
