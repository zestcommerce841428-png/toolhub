/**
 * Real EAN-13 barcode encoding (ISO/IEC 15420) — not a placeholder image
 * or a fake striped rectangle. Produces the actual 95-module bar pattern a
 * real scanner reads, built from the standard L/G/R digit-pattern tables
 * and first-digit parity table (see e.g. the "International Article
 * Number" article for the same reference tables). This is the family root
 * for tools/upc-a-barcode-generator/logic.js, since UPC-A is structurally
 * identical to EAN-13 with the first digit forced to 0 (see that file).
 */

// Left-hand, odd-parity patterns ("L-code" / Set A). Each is 7 modules.
const L_CODE = [
  "0001101", "0011001", "0010011", "0111101", "0100011",
  "0110001", "0101111", "0111011", "0110111", "0001011",
];

// Left-hand, even-parity patterns ("G-code" / Set B).
const G_CODE = [
  "0100111", "0110011", "0011011", "0100001", "0011101",
  "0111001", "0000101", "0010001", "0001001", "0010111",
];

// Right-hand patterns ("R-code" / Set C) — the bitwise complement of L-code.
const R_CODE = L_CODE.map((pattern) => [...pattern].map((bit) => (bit === "0" ? "1" : "0")).join(""));

// Which of L/G each of the 6 left-hand digits uses, indexed by the
// barcode's first digit (which is never itself drawn as its own pattern —
// it's encoded implicitly via this parity choice).
const PARITY_PATTERNS = [
  "LLLLLL", "LLGLGG", "LLGGLG", "LLGGGL", "LGLLGG",
  "LGGLLG", "LGGGLL", "LGLGLG", "LGLGGL", "LGGLGL",
];

const START_GUARD = "101";
const MIDDLE_GUARD = "01010";
const END_GUARD = "101";

/** @param {string} digits @returns {boolean} true if `digits` is a string of only 0-9 of the given length */
function isDigitString(digits, length) {
  return typeof digits === "string" && digits.length === length && /^\d+$/.test(digits);
}

/**
 * Computes the EAN-13 check digit for the first 12 digits.
 * @param {string} first12Digits
 * @returns {number}
 */
export function computeEan13CheckDigit(first12Digits) {
  if (!isDigitString(first12Digits, 12)) throw new Error("computeEan13CheckDigit expects exactly 12 digit characters.");
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = Number(first12Digits[i]);
    // Odd positions (1st, 3rd, ... 1-indexed) weight 1; even positions weight 3.
    sum += i % 2 === 0 ? digit : digit * 3;
  }
  return (10 - (sum % 10)) % 10;
}

/**
 * Validates and completes a 12- or 13-digit EAN-13 string. If 13 digits
 * are given, verifies the check digit rather than trusting it.
 * @param {string} input
 * @returns {{ ok: true, digits: string } | { ok: false, error: string }}
 */
export function resolveEan13Digits(input) {
  const trimmed = (input ?? "").trim();
  if (isDigitString(trimmed, 12)) {
    return { ok: true, digits: trimmed + computeEan13CheckDigit(trimmed) };
  }
  if (isDigitString(trimmed, 13)) {
    const expected = computeEan13CheckDigit(trimmed.slice(0, 12));
    if (Number(trimmed[12]) !== expected) {
      return { ok: false, error: `Check digit should be ${expected}, not ${trimmed[12]} — did you mean ${trimmed.slice(0, 12)}${expected}?` };
    }
    return { ok: true, digits: trimmed };
  }
  return { ok: false, error: "Enter exactly 12 digits (check digit will be calculated) or 13 digits (check digit will be verified)." };
}

/**
 * Builds the full 95-module bar/space pattern for a complete 13-digit
 * EAN-13 code (as returned by resolveEan13Digits).
 * @param {string} digits13
 * @returns {string} 95 characters of "1" (bar) / "0" (space)
 */
export function buildEan13Modules(digits13) {
  if (!isDigitString(digits13, 13)) throw new Error("buildEan13Modules expects exactly 13 digit characters.");

  const parity = PARITY_PATTERNS[Number(digits13[0])];
  const leftDigits = digits13.slice(1, 7);
  const rightDigits = digits13.slice(7, 13);

  const left = [...leftDigits]
    .map((digit, index) => (parity[index] === "L" ? L_CODE[Number(digit)] : G_CODE[Number(digit)]))
    .join("");
  const right = [...rightDigits].map((digit) => R_CODE[Number(digit)]).join("");

  return START_GUARD + left + MIDDLE_GUARD + right + END_GUARD;
}

/**
 * Renders a module bit-string as a scannable SVG barcode. Guard-pattern
 * modules are drawn taller, matching real EAN-13 printing convention
 * (makes the guard bars visually locatable, which is what most scanners'
 * decode algorithms also use to find the code).
 * @param {string} modules
 * @param {string} humanReadableDigits - shown as text under the bars
 * @param {{ moduleWidth?: number, height?: number }} [options]
 * @returns {string} an <svg>...</svg> string
 */
export function renderBarcodeSvg(modules, humanReadableDigits, options = {}) {
  const moduleWidth = options.moduleWidth ?? 2;
  const height = options.height ?? 80;
  const guardHeight = height + 10;
  const isGuardIndex = (index) =>
    index < 3 || index >= modules.length - 3 || (index >= 45 && index < 50);

  let bars = "";
  let x = 0;
  for (let i = 0; i < modules.length; i++) {
    if (modules[i] === "1") {
      const barHeight = isGuardIndex(i) ? guardHeight : height;
      bars += `<rect x="${x}" y="0" width="${moduleWidth}" height="${barHeight}" fill="#000" />`;
    }
    x += moduleWidth;
  }

  const totalWidth = modules.length * moduleWidth;
  const svgHeight = guardHeight + 20;
  return `<svg viewBox="0 0 ${totalWidth} ${svgHeight}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Barcode ${humanReadableDigits}">
    <rect x="0" y="0" width="${totalWidth}" height="${svgHeight}" fill="#fff" />
    ${bars}
    <text x="${totalWidth / 2}" y="${guardHeight + 16}" text-anchor="middle" font-family="ui-monospace, monospace" font-size="14" fill="#000">${humanReadableDigits}</text>
  </svg>`;
}
