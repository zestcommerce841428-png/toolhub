/**
 * UPC-A is, structurally, EAN-13 with an implicit leading 0: a UPC-A code
 * is 12 digits (11 data + 1 check digit), and encoding it is identical to
 * encoding "0" + those 12 digits as EAN-13 — same check-digit weights,
 * same L/G/R tables, same guard bars (parity pattern for leading digit 0
 * is always LLLLLL). Rather than duplicating any of that math, this file
 * only adds the "treat 12 digits as UPC-A, not raw EAN-13" framing — see
 * docs/CONTRIBUTING.md's "sharing logic.js across a tool family."
 */
import { computeEan13CheckDigit, buildEan13Modules, renderBarcodeSvg } from "../ean13-barcode-generator/logic.js";

function isDigitString(digits, length) {
  return typeof digits === "string" && digits.length === length && /^\d+$/.test(digits);
}

/**
 * Validates and completes an 11- or 12-digit UPC-A string, the same way
 * resolveEan13Digits does for EAN-13.
 * @param {string} input
 * @returns {{ ok: true, digits: string } | { ok: false, error: string }}
 */
export function resolveUpcADigits(input) {
  const trimmed = (input ?? "").trim();
  if (isDigitString(trimmed, 11)) {
    const checkDigit = computeEan13CheckDigit("0" + trimmed);
    return { ok: true, digits: trimmed + checkDigit };
  }
  if (isDigitString(trimmed, 12)) {
    const expected = computeEan13CheckDigit("0" + trimmed.slice(0, 11));
    if (Number(trimmed[11]) !== expected) {
      return { ok: false, error: `Check digit should be ${expected}, not ${trimmed[11]} — did you mean ${trimmed.slice(0, 11)}${expected}?` };
    }
    return { ok: true, digits: trimmed };
  }
  return { ok: false, error: "Enter exactly 11 digits (check digit will be calculated) or 12 digits (check digit will be verified)." };
}

/**
 * Builds the 95-module bar pattern for a complete 12-digit UPC-A code, by
 * delegating to the EAN-13 encoder with an implicit leading 0.
 * @param {string} digits12
 * @returns {string}
 */
export function buildUpcAModules(digits12) {
  if (!isDigitString(digits12, 12)) throw new Error("buildUpcAModules expects exactly 12 digit characters.");
  return buildEan13Modules("0" + digits12);
}

export { renderBarcodeSvg };
