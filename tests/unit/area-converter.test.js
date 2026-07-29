import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { AREA_UNITS, convertArea, convertToAllUnits, formatArea } from "../../tools/area-converter/logic.js";

describe("convertArea", () => {
  test("square meters to square feet", () => {
    assert.ok(Math.abs(convertArea(1, "m2", "ft2") - 10.7639) < 0.001);
  });
  test("same unit is a no-op", () => {
    assert.equal(convertArea(7, "ha", "ha"), 7);
  });
  test("hectare to square meters (exact definition)", () => {
    assert.equal(convertArea(1, "ha", "m2"), 10000);
  });
  test("acre to square meters", () => {
    assert.ok(Math.abs(convertArea(1, "acre", "m2") - 4046.8564224) < 1e-6);
  });
  test("square kilometer is 100 hectares", () => {
    assert.ok(Math.abs(convertArea(1, "km2", "ha") - 100) < 1e-9);
  });
  test("throws on an unknown unit", () => {
    assert.throws(() => convertArea(1, "leagues2", "m2"));
  });
});

describe("convertToAllUnits", () => {
  test("returns one entry per supported unit", () => {
    assert.equal(convertToAllUnits(1, "m2").length, AREA_UNITS.length);
  });
});

describe("formatArea", () => {
  test("handles non-finite input", () => {
    assert.equal(formatArea(NaN), "—");
  });
});
