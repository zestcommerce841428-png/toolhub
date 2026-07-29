/**
 * Rasterizes the master SVG brand assets (assets/icons/*.svg) into every
 * PNG/ICO size the site's <head> tags and manifest.json reference.
 *
 * This is a maintenance script, not part of the regular `npm run build` —
 * it only needs to run when the logo changes, so its output (the PNGs) is
 * committed to assets/icons/ like any other static asset, and the normal
 * build just copies them along with everything else in assets/icons/.
 *
 * Run via `npm run generate:icons`.
 */
import sharp from "sharp";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const iconsDir = path.join(rootDir, "assets/icons");

const markSvg = readFileSync(path.join(iconsDir, "icon-mark.svg"));
const maskableSvg = readFileSync(path.join(iconsDir, "icon-mark-maskable.svg"));
const ogSvg = readFileSync(path.join(iconsDir, "og-source.svg"));

const TILE_BACKGROUND = "#2563eb";

async function renderSquare(svgBuffer, size, outPath) {
  await sharp(svgBuffer, { density: 384 }).resize(size, size).png().toFile(outPath);
  console.log(`  wrote ${path.relative(rootDir, outPath)} (${size}x${size})`);
}

async function renderContain(svgBuffer, width, height, background, outPath) {
  await sharp(svgBuffer, { density: 384 })
    .resize(width, height, { fit: "contain", background })
    .png()
    .toFile(outPath);
  console.log(`  wrote ${path.relative(rootDir, outPath)} (${width}x${height})`);
}

/**
 * Packs PNG buffers into a modern PNG-in-ICO file — supported by every
 * browser and by Windows since Vista, and far simpler to hand-roll
 * correctly than to pull in a dependency for (the alternative, `to-ico`,
 * drags in a `jimp` -> `request` chain with 12 known vulnerabilities,
 * several critical — not an acceptable trade for one file format).
 * @param {Array<{ size: number, buffer: Buffer }>} images
 */
function packIco(images) {
  const headerSize = 6;
  const dirEntrySize = 16;
  const dirSize = dirEntrySize * images.length;
  let offset = headerSize + dirSize;

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: 1 = icon
  header.writeUInt16LE(images.length, 4);

  const dirEntries = [];
  const dataBlocks = [];
  for (const { size, buffer } of images) {
    const entry = Buffer.alloc(dirEntrySize);
    entry.writeUInt8(size >= 256 ? 0 : size, 0); // width (0 = 256)
    entry.writeUInt8(size >= 256 ? 0 : size, 1); // height (0 = 256)
    entry.writeUInt8(0, 2); // color palette count
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(buffer.length, 8); // image data size
    entry.writeUInt32LE(offset, 12); // offset from file start
    dirEntries.push(entry);
    dataBlocks.push(buffer);
    offset += buffer.length;
  }

  return Buffer.concat([header, ...dirEntries, ...dataBlocks]);
}

async function main() {
  mkdirSync(iconsDir, { recursive: true });
  mkdirSync(path.join(rootDir, "assets/images"), { recursive: true });

  console.log("Favicons (icon-mark.svg):");
  const favicon16 = path.join(iconsDir, "favicon-16x16.png");
  const favicon32 = path.join(iconsDir, "favicon-32x32.png");
  const favicon48 = path.join(iconsDir, "favicon-48x48.png");
  await renderSquare(markSvg, 16, favicon16);
  await renderSquare(markSvg, 32, favicon32);
  await renderSquare(markSvg, 48, favicon48);
  await renderSquare(markSvg, 96, path.join(iconsDir, "favicon-96x96.png"));

  const icoBuffer = packIco([
    { size: 16, buffer: readFileSync(favicon16) },
    { size: 32, buffer: readFileSync(favicon32) },
    { size: 48, buffer: readFileSync(favicon48) },
  ]);
  writeFileSync(path.join(iconsDir, "favicon.ico"), icoBuffer);
  console.log(`  wrote assets/icons/favicon.ico (16+32+48 packed)`);

  console.log("Apple touch icons (icon-mark-maskable.svg, full-bleed — Apple applies its own corner rounding):");
  for (const size of [120, 152, 167, 180]) {
    await renderSquare(maskableSvg, size, path.join(iconsDir, `apple-touch-icon-${size}x${size}.png`));
  }
  await renderSquare(maskableSvg, 180, path.join(iconsDir, "apple-touch-icon.png"));

  console.log("PWA / Android manifest icons:");
  for (const size of [192, 256, 384, 512]) {
    await renderSquare(markSvg, size, path.join(iconsDir, `icon-${size}x${size}.png`));
  }
  for (const size of [192, 512]) {
    await renderSquare(maskableSvg, size, path.join(iconsDir, `icon-${size}x${size}-maskable.png`));
  }

  console.log("Windows tiles (icon-mark-maskable.svg, full-bleed brand-blue background):");
  await renderSquare(maskableSvg, 70, path.join(iconsDir, "mstile-70x70.png"));
  await renderSquare(maskableSvg, 150, path.join(iconsDir, "mstile-150x150.png"));
  await renderSquare(maskableSvg, 310, path.join(iconsDir, "mstile-310x310.png"));
  await renderContain(markSvg, 310, 150, TILE_BACKGROUND, path.join(iconsDir, "mstile-310x150.png"));

  console.log("Social share image (og-source.svg):");
  await sharp(ogSvg, { density: 384 }).resize(1200, 630).png().toFile(path.join(rootDir, "assets/images/og-default.png"));
  console.log("  wrote assets/images/og-default.png (1200x630)");

  console.log("\nDone.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
