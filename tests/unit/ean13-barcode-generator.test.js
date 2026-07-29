import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  computeEan13CheckDigit,
  resolveEan13Digits,
  buildEan13Modules,
  renderBarcodeSvg,
} from "../../tools/ean13-barcode-generator/logic.js";

describe("computeEan13CheckDigit", () => {
  test("real-world barcode: 4006381333931 (a widely-cited EAN-13 example)", () => {
    assert.equal(computeEan13CheckDigit("400638133393"), 1);
  });
  test("real-world barcode: 5901234123457 (Wikipedia's own EAN-13 example)", () => {
    assert.equal(computeEan13CheckDigit("590123412345"), 7);
  });
  test("all-zeros is self-consistent (check digit is also 0)", () => {
    assert.equal(computeEan13CheckDigit("000000000000"), 0);
  });
  test("throws on the wrong length", () => {
    assert.throws(() => computeEan13CheckDigit("123"));
  });
});

describe("resolveEan13Digits", () => {
  test("accepts 12 digits and computes the 13th", () => {
    const result = resolveEan13Digits("400638133393");
    assert.equal(result.ok, true);
    assert.equal(result.digits, "4006381333931");
  });
  test("accepts 13 digits with a correct check digit", () => {
    const result = resolveEan13Digits("5901234123457");
    assert.equal(result.ok, true);
    assert.equal(result.digits, "5901234123457");
  });
  test("rejects 13 digits with a wrong check digit, and suggests the fix", () => {
    const result = resolveEan13Digits("5901234123450");
    assert.equal(result.ok, false);
    assert.match(result.error, /5901234123457/);
  });
  test("rejects non-digit input", () => {
    assert.equal(resolveEan13Digits("12345678901x").ok, false);
  });
  test("rejects the wrong length", () => {
    assert.equal(resolveEan13Digits("123").ok, false);
  });
  test("trims surrounding whitespace", () => {
    assert.equal(resolveEan13Digits("  400638133393  ").ok, true);
  });
});

describe("buildEan13Modules", () => {
  test("is exactly 95 modules", () => {
    assert.equal(buildEan13Modules("4006381333931").length, 95);
  });
  test("starts and ends with the guard pattern 101", () => {
    const modules = buildEan13Modules("4006381333931");
    assert.equal(modules.slice(0, 3), "101");
    assert.equal(modules.slice(-3), "101");
  });
  test("has the middle guard 01010 at modules 45-49", () => {
    const modules = buildEan13Modules("4006381333931");
    assert.equal(modules.slice(45, 50), "01010");
  });
  test("all-zeros barcode matches a hand-computed exact pattern", () => {
    // Digit 0 always uses L-code "0001101" (left) / its complement
    // "1110010" (right, R-code), and first-digit 0 always means parity
    // pattern LLLLLL — so this exact 95-bit string can be verified by hand
    // from the standard tables without relying on any other table entry.
    const expected = "101" + "0001101".repeat(6) + "01010" + "1110010".repeat(6) + "101";
    assert.equal(buildEan13Modules("0000000000000"), expected);
  });
  test("throws on the wrong length", () => {
    assert.throws(() => buildEan13Modules("123"));
  });
});

describe("renderBarcodeSvg", () => {
  test("produces a valid-looking SVG containing the human-readable digits", () => {
    const modules = buildEan13Modules("4006381333931");
    const svg = renderBarcodeSvg(modules, "4006381333931");
    assert.match(svg, /^<svg/);
    assert.match(svg, /<\/svg>$/);
    assert.match(svg, /4006381333931/);
  });
  test("viewBox width matches module count x module width", () => {
    const modules = buildEan13Modules("4006381333931");
    const svg = renderBarcodeSvg(modules, "4006381333931", { moduleWidth: 3 });
    assert.match(svg, /viewBox="0 0 285 /);
  });
});
