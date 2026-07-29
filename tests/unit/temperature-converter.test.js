import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { TEMPERATURE_UNITS, convertTemperature, convertToAllUnits, formatTemperature } from "../../tools/temperature-converter/logic.js";

describe("convertTemperature", () => {
  test("0 C is 32 F", () => {
    const result = convertTemperature(0, "c", "f");
    assert.equal(result.ok, true);
    assert.equal(result.value, 32);
  });
  test("100 C is 212 F", () => {
    assert.equal(convertTemperature(100, "c", "f").value, 212);
  });
  test("0 C is 273.15 K", () => {
    assert.ok(Math.abs(convertTemperature(0, "c", "k").value - 273.15) < 1e-9);
  });
  test("absolute zero round-trips through every scale", () => {
    assert.ok(Math.abs(convertTemperature(-273.15, "c", "k").value - 0) < 1e-9);
    assert.ok(Math.abs(convertTemperature(-459.67, "f", "k").value - 0) < 1e-6);
    assert.ok(Math.abs(convertTemperature(0, "r", "c").value - -273.15) < 1e-9);
  });
  test("same unit is a no-op", () => {
    assert.equal(convertTemperature(37, "c", "c").value, 37);
  });
  test("rejects a value below absolute zero", () => {
    const result = convertTemperature(-300, "c", "f");
    assert.equal(result.ok, false);
    assert.match(result.error, /absolute zero/);
  });
  test("rejects an unknown unit", () => {
    assert.equal(convertTemperature(0, "made-up", "c").ok, false);
  });
  test("F <-> C round-trip is consistent", () => {
    const asF = convertTemperature(37, "c", "f").value;
    const backToC = convertTemperature(asF, "f", "c").value;
    assert.ok(Math.abs(backToC - 37) < 1e-9);
  });
});

describe("convertToAllUnits", () => {
  test("returns one entry per supported unit", () => {
    const results = convertToAllUnits(0, "c");
    assert.equal(results.length, TEMPERATURE_UNITS.length);
  });
});

describe("formatTemperature", () => {
  test("handles non-finite input", () => {
    assert.equal(formatTemperature(NaN), "—");
  });
});
