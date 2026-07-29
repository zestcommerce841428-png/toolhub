/**
 * Pure HEX <-> RGB(A) color math. No DOM, no color libraries — the
 * conversion is simple enough that a dependency would be pure overhead.
 */

const HEX_RE = /^#?([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

function expandShorthand(hex) {
  // "f0c" -> "ff00cc", "f0cf" -> "ff00ccff"
  return hex.length <= 4 ? [...hex].map((char) => char + char).join("") : hex;
}

/**
 * Parses any valid HEX color (3/4/6/8 digits, with or without '#') into RGBA.
 * @param {string} input
 * @returns {{ r:number, g:number, b:number, a:number } | null} a is 0–1
 */
export function parseHex(input) {
  const trimmed = input.trim();
  if (!HEX_RE.test(trimmed)) return null;

  const hex = expandShorthand(trimmed.replace(/^#/, "").toLowerCase());
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const a = hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1;

  return { r, g, b, a: Math.round(a * 1000) / 1000 };
}

function toHexByte(value) {
  return clampByte(value).toString(16).padStart(2, "0");
}

/** Clamps and rounds a value to a valid 0–255 byte. */
export function clampByte(value) {
  return Math.min(255, Math.max(0, Math.round(value)));
}

/**
 * Formats RGBA as a HEX string. Omits the alpha channel (returns 6 digits)
 * when alpha is 1 (fully opaque), since that's the common case.
 * @param {{ r:number, g:number, b:number, a?:number }} rgba
 */
export function rgbToHex({ r, g, b, a = 1 }) {
  const base = `#${toHexByte(r)}${toHexByte(g)}${toHexByte(b)}`;
  if (a >= 1) return base;
  return `${base}${toHexByte(Math.round(clamp01(a) * 255))}`;
}

function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}

/** Formats RGBA as an "rgb(r, g, b)" or "rgba(r, g, b, a)" CSS string. */
export function formatRgbString({ r, g, b, a = 1 }) {
  if (a >= 1) return `rgb(${clampByte(r)}, ${clampByte(g)}, ${clampByte(b)})`;
  return `rgba(${clampByte(r)}, ${clampByte(g)}, ${clampByte(b)}, ${clamp01(a)})`;
}

/**
 * Parses "rgb(255, 0, 0)", "rgba(255, 0, 0, 0.5)", or bare "255, 0, 0".
 * @param {string} input
 * @returns {{ r:number, g:number, b:number, a:number } | null}
 */
export function parseRgbString(input) {
  const match = input
    .trim()
    .match(/^(?:rgba?\(\s*)?(\d{1,3})\s*[,\s]\s*(\d{1,3})\s*[,\s]\s*(\d{1,3})\s*(?:[,\s]\s*(0|1|0?\.\d+))?\s*\)?$/i);
  if (!match) return null;

  const [, r, g, b, a] = match;
  const red = Number(r);
  const green = Number(g);
  const blue = Number(b);
  if ([red, green, blue].some((component) => component > 255)) return null;

  return { r: red, g: green, b: blue, a: a === undefined ? 1 : Number(a) };
}
