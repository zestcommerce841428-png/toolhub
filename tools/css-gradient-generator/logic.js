/** Builds valid CSS linear/radial gradient strings from a list of color stops. Reuses hex-rgb-converter's parseHex for validation. */
import { parseHex } from "../hex-rgb-converter/logic.js";

/**
 * @typedef {object} GradientStop
 * @property {string} color - hex color
 * @property {number} position - 0-100
 */

/** @param {GradientStop[]} stops @returns {{ ok: true } | { ok: false, error: string }} */
export function validateStops(stops) {
  if (stops.length < 2) return { ok: false, error: "Add at least 2 color stops." };
  for (const stop of stops) {
    if (!parseHex(stop.color)) return { ok: false, error: `"${stop.color}" isn't a valid hex color.` };
    if (!Number.isFinite(stop.position) || stop.position < 0 || stop.position > 100) {
      return { ok: false, error: "Each stop's position must be between 0 and 100." };
    }
  }
  return { ok: true };
}

function formatStopList(stops) {
  return stops.map((stop) => `${stop.color} ${stop.position}%`).join(", ");
}

/**
 * @param {GradientStop[]} stops
 * @param {number} angleDeg
 * @returns {{ ok: true, css: string } | { ok: false, error: string }}
 */
export function buildLinearGradient(stops, angleDeg) {
  const validation = validateStops(stops);
  if (!validation.ok) return validation;
  return { ok: true, css: `linear-gradient(${angleDeg}deg, ${formatStopList(stops)})` };
}

/**
 * @param {GradientStop[]} stops
 * @param {"circle"|"ellipse"} shape
 * @returns {{ ok: true, css: string } | { ok: false, error: string }}
 */
export function buildRadialGradient(stops, shape) {
  const validation = validateStops(stops);
  if (!validation.ok) return validation;
  return { ok: true, css: `radial-gradient(${shape}, ${formatStopList(stops)})` };
}

/** Evenly spaces `count` stop positions across 0-100 (e.g. 3 stops -> [0, 50, 100]). */
export function evenlyDistributedPositions(count) {
  if (count <= 1) return [0];
  return Array.from({ length: count }, (_, index) => Math.round((index / (count - 1)) * 100));
}
