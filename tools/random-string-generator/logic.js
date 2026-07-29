/**
 * Generic secure random string generation — distinct from
 * password-generator's logic.js: no strength meter or guaranteed
 * per-category character, just N random characters drawn from whatever
 * pool is selected, including an arbitrary custom character set.
 */
import { secureRandomInt } from "../../assets/js/core/random.js";

export const CHAR_SETS = {
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  digits: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.<>?/",
};

/**
 * @param {{ lowercase?: boolean, uppercase?: boolean, digits?: boolean, symbols?: boolean, customChars?: string }} options
 * @returns {string} the combined, deduplicated character pool
 */
export function buildCharacterPool(options) {
  let pool = "";
  if (options.lowercase) pool += CHAR_SETS.lowercase;
  if (options.uppercase) pool += CHAR_SETS.uppercase;
  if (options.digits) pool += CHAR_SETS.digits;
  if (options.symbols) pool += CHAR_SETS.symbols;
  if (options.customChars) pool += options.customChars;
  // De-duplicate so a custom set overlapping a preset category doesn't
  // skew the distribution toward the repeated characters.
  return [...new Set(pool)].join("");
}

/**
 * @param {number} length
 * @param {number} count
 * @param {{ lowercase?: boolean, uppercase?: boolean, digits?: boolean, symbols?: boolean, customChars?: string }} options
 * @returns {{ ok: true, strings: string[] } | { ok: false, error: string }}
 */
export function generateRandomStrings(length, count, options) {
  if (!Number.isInteger(length) || length < 1) return { ok: false, error: "Length must be a positive whole number." };
  if (!Number.isInteger(count) || count < 1) return { ok: false, error: "Count must be a positive whole number." };

  const pool = buildCharacterPool(options);
  if (pool.length === 0) return { ok: false, error: "Select at least one character type, or enter custom characters." };

  const strings = Array.from({ length: count }, () =>
    Array.from({ length }, () => pool[secureRandomInt(0, pool.length - 1)]).join("")
  );
  return { ok: true, strings };
}
