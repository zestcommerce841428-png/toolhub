import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { LENGTH_UNITS, convertLength, convertToAllUnits, formatLength } from "../../tools/length-converter/logic.js";

describe("convertLength", () => {
  test("meters to feet", () => {
    assert.ok(Math.abs(convertLength(1, "m", "ft") - 3.28084) < 0.001);
  });
  test("same unit is a no-op", () => {
    assert.equal(convertLength(42, "cm", "cm"), 42);
  });
  test("inches to centimeters (well-known constant)", () => {
    assert.ok(Math.abs(convertLength(1, "in", "cm") - 2.54) < 0.0001);
  });
  test("miles to kilometers", () => {
    assert.ok(Math.abs(convertLength(1, "mi", "km") - 1.609344) < 0.0001);
  });
  test("throws on an unknown unit", () => {
    assert.throws(() => convertLength(1, "parsecs", "m"));
  });
});

describe("convertToAllUnits", () => {
  test("returns one entry per supported unit", () => {
    const results = convertToAllUnits(1, "m");
    assert.equal(results.length, LENGTH_UNITS.length);
    assert.ok(results.every((entry) => Number.isFinite(entry.value)));
  });
});

describe("formatLength", () => {
  test("handles non-finite input", () => {
    assert.equal(formatLength(NaN), "—");
  });
  test("formats zero", () => {
    assert.equal(formatLength(0), "0");
  });
});
