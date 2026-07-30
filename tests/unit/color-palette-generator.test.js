import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { rgbToHsl, hslToRgb, generatePalette, PALETTE_SCHEMES } from "../../tools/color-palette-generator/logic.js";

describe("rgbToHsl", () => {
  test("pure red is hsl(0, 100, 50)", () => {
    assert.deepEqual(rgbToHsl({ r: 255, g: 0, b: 0 }), { h: 0, s: 100, l: 50 });
  });
  test("pure green is hsl(120, 100, 50)", () => {
    assert.deepEqual(rgbToHsl({ r: 0, g: 255, b: 0 }), { h: 120, s: 100, l: 50 });
  });
  test("pure blue is hsl(240, 100, 50)", () => {
    assert.deepEqual(rgbToHsl({ r: 0, g: 0, b: 255 }), { h: 240, s: 100, l: 50 });
  });
  test("white has 0 saturation and 100 lightness", () => {
    const hsl = rgbToHsl({ r: 255, g: 255, b: 255 });
    assert.equal(hsl.s, 0);
    assert.equal(hsl.l, 100);
  });
  test("black has 0 saturation and 0 lightness", () => {
    const hsl = rgbToHsl({ r: 0, g: 0, b: 0 });
    assert.equal(hsl.s, 0);
    assert.equal(hsl.l, 0);
  });
});

describe("hslToRgb", () => {
  test("hsl(0, 100, 50) is pure red", () => {
    assert.deepEqual(hslToRgb({ h: 0, s: 100, l: 50 }), { r: 255, g: 0, b: 0 });
  });
  test("hsl(180, 100, 50) is cyan", () => {
    assert.deepEqual(hslToRgb({ h: 180, s: 100, l: 50 }), { r: 0, g: 255, b: 255 });
  });
  test("round-trips with rgbToHsl for an arbitrary color", () => {
    const original = { r: 128, g: 64, b: 200 };
    const roundTripped = hslToRgb(rgbToHsl(original));
    // Allow +/-1 per channel for HSL's inherent rounding.
    assert.ok(Math.abs(roundTripped.r - original.r) <= 1);
    assert.ok(Math.abs(roundTripped.g - original.g) <= 1);
    assert.ok(Math.abs(roundTripped.b - original.b) <= 1);
  });
});

describe("generatePalette", () => {
  test("complementary returns 2 colors, the second being the base's true complement", () => {
    const result = generatePalette("#ff0000", "complementary");
    assert.equal(result.ok, true);
    assert.equal(result.colors.length, 2);
    assert.equal(result.colors[0], "#ff0000");
    assert.equal(result.colors[1], "#00ffff"); // red's complement is cyan
  });
  test("analogous returns 3 colors with the base in the middle", () => {
    const result = generatePalette("#ff0000", "analogous");
    assert.equal(result.colors.length, 3);
    assert.equal(result.colors[1], "#ff0000");
  });
  test("triadic returns 3 evenly-spaced colors", () => {
    const result = generatePalette("#ff0000", "triadic");
    assert.equal(result.colors.length, 3);
    assert.equal(result.colors[0], "#ff0000");
  });
  test("splitComplementary returns 3 colors", () => {
    assert.equal(generatePalette("#ff0000", "splitComplementary").colors.length, 3);
  });
  test("monochromatic returns 5 shades of the same hue", () => {
    const result = generatePalette("#3366cc", "monochromatic");
    assert.equal(result.colors.length, 5);
  });
  test("every scheme in PALETTE_SCHEMES actually works", () => {
    for (const scheme of PALETTE_SCHEMES) {
      const result = generatePalette("#3366cc", scheme);
      assert.equal(result.ok, true, `${scheme} should succeed`);
      assert.ok(result.colors.length > 0);
    }
  });
  test("rejects an invalid hex color", () => {
    assert.equal(generatePalette("not-a-color", "complementary").ok, false);
  });
});
