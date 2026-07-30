/**
 * Generates harmonious color palettes from a base color using standard
 * color-wheel relationships (complementary, analogous, triadic, etc.),
 * computed via real HSL hue rotation rather than a lookup table. Reuses
 * hex-rgb-converter's parseHex/rgbToHex rather than re-implementing hex
 * parsing — see docs/CONTRIBUTING.md's "sharing logic.js across a tool
 * family."
 */
import { parseHex, rgbToHex, clampByte } from "../hex-rgb-converter/logic.js";

/** @param {{r:number,g:number,b:number}} rgb @returns {{h:number,s:number,l:number}} h in [0,360), s/l in [0,100] */
export function rgbToHsl({ r, g, b }) {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;

  let hue = 0;
  if (delta !== 0) {
    if (max === rNorm) hue = 60 * (((gNorm - bNorm) / delta) % 6);
    else if (max === gNorm) hue = 60 * ((bNorm - rNorm) / delta + 2);
    else hue = 60 * ((rNorm - gNorm) / delta + 4);
  }
  if (hue < 0) hue += 360;

  const lightness = (max + min) / 2;
  const saturation = delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1));

  return { h: Math.round(hue), s: Math.round(saturation * 100), l: Math.round(lightness * 100) };
}

/** @param {{h:number,s:number,l:number}} hsl @returns {{r:number,g:number,b:number}} */
export function hslToRgb({ h, s, l }) {
  const hue = ((h % 360) + 360) % 360;
  const sat = s / 100;
  const light = l / 100;

  const c = (1 - Math.abs(2 * light - 1)) * sat;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = light - c / 2;

  let [r1, g1, b1] = [0, 0, 0];
  if (hue < 60) [r1, g1, b1] = [c, x, 0];
  else if (hue < 120) [r1, g1, b1] = [x, c, 0];
  else if (hue < 180) [r1, g1, b1] = [0, c, x];
  else if (hue < 240) [r1, g1, b1] = [0, x, c];
  else if (hue < 300) [r1, g1, b1] = [x, 0, c];
  else [r1, g1, b1] = [c, 0, x];

  return {
    r: clampByte((r1 + m) * 255),
    g: clampByte((g1 + m) * 255),
    b: clampByte((b1 + m) * 255),
  };
}

function rotateHue(hsl, degrees) {
  return { ...hsl, h: ((hsl.h + degrees) % 360 + 360) % 360 };
}

export const PALETTE_SCHEMES = ["complementary", "analogous", "triadic", "splitComplementary", "monochromatic"];

/**
 * @param {string} baseHex
 * @param {typeof PALETTE_SCHEMES[number]} scheme
 * @returns {{ ok: true, colors: string[] } | { ok: false, error: string }}
 */
export function generatePalette(baseHex, scheme) {
  const rgb = parseHex(baseHex);
  if (!rgb) return { ok: false, error: "Enter a valid hex color." };
  const baseHsl = rgbToHsl(rgb);

  let hslColors;
  switch (scheme) {
    case "complementary":
      hslColors = [baseHsl, rotateHue(baseHsl, 180)];
      break;
    case "analogous":
      hslColors = [rotateHue(baseHsl, -30), baseHsl, rotateHue(baseHsl, 30)];
      break;
    case "triadic":
      hslColors = [baseHsl, rotateHue(baseHsl, 120), rotateHue(baseHsl, 240)];
      break;
    case "splitComplementary":
      hslColors = [baseHsl, rotateHue(baseHsl, 150), rotateHue(baseHsl, 210)];
      break;
    case "monochromatic":
      hslColors = [20, 35, 50, 65, 80].map((l) => ({ ...baseHsl, l }));
      break;
    default:
      return { ok: false, error: `Unknown palette scheme: ${scheme}` };
  }

  return { ok: true, colors: hslColors.map((hsl) => rgbToHex(hslToRgb(hsl))) };
}
