import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { SPEED_UNITS, convertSpeed, convertToAllUnits, formatSpeed } from "../../tools/speed-converter/logic.js";

describe("convertSpeed", () => {
  test("km/h to mph (well-known approximation)", () => {
    assert.ok(Math.abs(convertSpeed(100, "kph", "mph") - 62.1371) < 0.01);
  });
  test("same unit is a no-op", () => {
    assert.equal(convertSpeed(10, "mps", "mps"), 10);
  });
  test("m/s to km/h", () => {
    assert.ok(Math.abs(convertSpeed(1, "mps", "kph") - 3.6) < 1e-9);
  });
  test("mph to m/s (exact US definition)", () => {
    assert.equal(convertSpeed(1, "mph", "mps"), 0.44704);
  });
  test("throws on an unknown unit", () => {
    assert.throws(() => convertSpeed(1, "warp", "mps"));
  });
});

describe("convertToAllUnits", () => {
  test("returns one entry per supported unit", () => {
    assert.equal(convertToAllUnits(1, "mps").length, SPEED_UNITS.length);
  });
});

describe("formatSpeed", () => {
  test("handles non-finite input", () => {
    assert.equal(formatSpeed(NaN), "—");
  });
});
