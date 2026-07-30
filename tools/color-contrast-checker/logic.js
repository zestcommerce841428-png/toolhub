/**
 * WCAG 2.x contrast ratio math (the same formula browsers' own
 * accessibility inspectors use). Reuses hex-rgb-converter's already-
 * tested parseHex rather than re-implementing hex parsing — see
 * docs/CONTRIBUTING.md's "sharing logic.js across a tool family."
 */
import { parseHex } from "../hex-rgb-converter/logic.js";

/** Converts a single sRGB channel (0-255) to its linearized value, per the WCAG formula. */
function linearizeChannel(value8bit) {
  const c = value8bit / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/**
 * WCAG relative luminance of an sRGB color, in [0, 1].
 * @param {{ r: number, g: number, b: number }} rgb
 * @returns {number}
 */
export function relativeLuminance({ r, g, b }) {
  const rLin = linearizeChannel(r);
  const gLin = linearizeChannel(g);
  const bLin = linearizeChannel(b);
  return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
}

/**
 * WCAG contrast ratio between two sRGB colors, in [1, 21].
 * @param {{ r: number, g: number, b: number }} rgbA
 * @param {{ r: number, g: number, b: number }} rgbB
 * @returns {number}
 */
export function contrastRatio(rgbA, rgbB) {
  const lumA = relativeLuminance(rgbA);
  const lumB = relativeLuminance(rgbB);
  const lighter = Math.max(lumA, lumB);
  const darker = Math.min(lumA, lumB);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * WCAG pass/fail at every standard threshold: AA/AAA, normal/large text,
 * plus the separate (lower) AA threshold for UI components and graphics.
 * @param {number} ratio
 * @returns {{ aaNormal: boolean, aaLarge: boolean, aaaNormal: boolean, aaaLarge: boolean, uiComponents: boolean }}
 */
export function evaluateWcagCompliance(ratio) {
  return {
    aaNormal: ratio >= 4.5,
    aaLarge: ratio >= 3,
    aaaNormal: ratio >= 7,
    aaaLarge: ratio >= 4.5,
    uiComponents: ratio >= 3,
  };
}

/**
 * @param {string} hexA
 * @param {string} hexB
 * @returns {{ ok: true, ratio: number, compliance: ReturnType<typeof evaluateWcagCompliance> } | { ok: false, error: string }}
 */
export function checkContrast(hexA, hexB) {
  const rgbA = parseHex(hexA);
  const rgbB = parseHex(hexB);
  if (!rgbA) return { ok: false, error: "First color isn't a valid hex color." };
  if (!rgbB) return { ok: false, error: "Second color isn't a valid hex color." };

  const ratio = contrastRatio(rgbA, rgbB);
  return { ok: true, ratio, compliance: evaluateWcagCompliance(ratio) };
}
