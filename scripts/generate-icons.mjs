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

const bg = { r: 251, g: 248, b: 243, alpha: 1 };

for (const target of targets) {
  if (target.maskable) {
    // Maskable: Logo bei 72% mit Hintergrund-Padding
    const logoSize = Math.round(target.size * 0.72);
    const padding = Math.round((target.size - logoSize) / 2);
    const logo = await sharp(svg).resize(logoSize, logoSize).png().toBuffer();
    await sharp({
      create: {
        width: target.size,
        height: target.size,
        channels: 4,
        background: bg
      }
    })
      .composite([{ input: logo, top: padding, left: padding }])
      .png({ quality: 90, compressionLevel: 9 })
      .toFile(resolve(iconsDir, target.name));
  } else {
    await sharp(svg)
      .resize(target.size, target.size, {
        fit: 'contain',
        background: bg
      })
      .png({ quality: 90, compressionLevel: 9 })
      .toFile(resolve(iconsDir, target.name));
  }
  console.log(`✔ ${target.name} (${target.size}×${target.size})`);
}

// OG-Default-Bild 1200x630
const ogBg = await sharp({
  create: { width: 1200, height: 630, channels: 4, background: { r: 251, g: 242, b: 220, alpha: 1 } }
}).png().toBuffer();

const ogLogo = await sharp(svg).resize(360, 360).png().toBuffer();

await sharp(ogBg)
  .composite([{ input: ogLogo, top: 135, left: 130 }])
  .png({ quality: 90 })
  .toFile(resolve(root, 'static/og-default.png'));
console.log('✔ og-default.png (1200×630)');
