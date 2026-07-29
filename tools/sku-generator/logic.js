import { secureRandomInt } from "../../assets/js/core/random.js";

/** Uppercases, strips anything but letters/numbers, and caps segment length so SKU parts stay compact. */
function sanitizeSegment(text, maxLength = 12) {
  return text
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "")
    .slice(0, maxLength);
}

/** Generates a zero-padded random numeric string of the given length using the shared secure RNG. */
export function randomDigits(length) {
  if (length <= 0) return "";
  const max = 10 ** length - 1;
  return String(secureRandomInt(0, max)).padStart(length, "0");
}

/**
 * @param {{ categoryCode?: string, productName?: string, variant?: string, separator?: string, suffixLength?: number }} options
 * @returns {{ ok: true, sku: string } | { ok: false, error: string }}
 */
export function generateSku({ categoryCode = "", productName = "", variant = "", separator = "-", suffixLength = 4 }) {
  const segments = [sanitizeSegment(categoryCode), sanitizeSegment(productName, 16), sanitizeSegment(variant)].filter(
    Boolean
  );

  if (segments.length === 0 && suffixLength <= 0) {
    return { ok: false, error: "Fill in at least one field, or keep the random suffix enabled." };
  }

  const suffix = randomDigits(suffixLength);
  if (suffix) segments.push(suffix);

  return { ok: true, sku: segments.join(separator) };
}
