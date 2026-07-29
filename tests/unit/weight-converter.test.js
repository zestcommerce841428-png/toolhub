import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { WEIGHT_UNITS, convertWeight, convertToAllUnits, formatWeight } from "../../tools/weight-converter/logic.js";

describe("convertWeight", () => {
  test("kilograms to pounds", () => {
    assert.ok(Math.abs(convertWeight(1, "kg", "lb") - 2.20462) < 0.001);
  });
  test("same unit is a no-op", () => {
    assert.equal(convertWeight(42, "g", "g"), 42);
  });
  test("pounds to kilograms (exact SI definition)", () => {
    assert.ok(Math.abs(convertWeight(1, "lb", "kg") - 0.45359237) < 1e-9);
  });
  test("metric tons to kilograms", () => {
    assert.equal(convertWeight(1, "t", "kg"), 1000);
  });
  test("stone to pounds (well-known: 1 stone = 14 lb)", () => {
    assert.ok(Math.abs(convertWeight(1, "st", "lb") - 14) < 0.01);
  });
  test("throws on an unknown unit", () => {
    assert.throws(() => convertWeight(1, "slugs", "kg"));
  });
});

describe("convertToAllUnits", () => {
  test("returns one entry per supported unit", () => {
    const results = convertToAllUnits(1, "kg");
    assert.equal(results.length, WEIGHT_UNITS.length);
    assert.ok(results.every((entry) => Number.isFinite(entry.value)));
  });
});

describe("formatWeight", () => {
  test("handles non-finite input", () => {
    assert.equal(formatWeight(NaN), "—");
  });
});
