import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { VOLUME_UNITS, convertVolume, convertToAllUnits, formatVolume } from "../../tools/volume-converter/logic.js";

describe("convertVolume", () => {
  test("liters to US gallons", () => {
    assert.ok(Math.abs(convertVolume(1, "l", "galUs") - 0.264172) < 0.001);
  });
  test("same unit is a no-op", () => {
    assert.equal(convertVolume(5, "ml", "ml"), 5);
  });
  test("US gallon to liters (exact US definition)", () => {
    assert.equal(convertVolume(1, "galUs", "l"), 3.785411784);
  });
  test("imperial gallon differs from US gallon", () => {
    const usInLiters = convertVolume(1, "galUs", "l");
    const impInLiters = convertVolume(1, "galImp", "l");
    assert.ok(impInLiters > usInLiters, "imperial gallon should be larger than US gallon");
  });
  test("3 teaspoons equal 1 tablespoon (well-known kitchen conversion)", () => {
    const threeTsp = convertVolume(3, "tsp", "l");
    const oneTbsp = convertVolume(1, "tbsp", "l");
    assert.ok(Math.abs(threeTsp - oneTbsp) < 1e-9);
  });
  test("throws on an unknown unit", () => {
    assert.throws(() => convertVolume(1, "barrels", "l"));
  });
});

describe("convertToAllUnits", () => {
  test("returns one entry per supported unit", () => {
    assert.equal(convertToAllUnits(1, "l").length, VOLUME_UNITS.length);
  });
});

describe("formatVolume", () => {
  test("handles non-finite input", () => {
    assert.equal(formatVolume(NaN), "—");
  });
});
