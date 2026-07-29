import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { percentOf, whatPercent, percentChange, formatPercentResult } from "../../tools/percentage-calculator/logic.js";

describe("percentOf", () => {
  test("20% of 50 is 10", () => {
    assert.equal(percentOf(20, 50), 10);
  });
  test("0% of anything is 0", () => {
    assert.equal(percentOf(0, 999), 0);
  });
  test("handles non-finite input", () => {
    assert.ok(Number.isNaN(percentOf(NaN, 50)));
  });
});

describe("whatPercent", () => {
  test("10 is 20% of 50", () => {
    assert.equal(whatPercent(10, 50), 20);
  });
  test("part equal to whole is 100%", () => {
    assert.equal(whatPercent(50, 50), 100);
  });
  test("division by zero whole returns NaN, not Infinity", () => {
    assert.ok(Number.isNaN(whatPercent(10, 0)));
  });
});

describe("percentChange", () => {
  test("50 to 65 is +30%", () => {
    assert.equal(percentChange(50, 65), 30);
  });
  test("50 to 25 is -50%", () => {
    assert.equal(percentChange(50, 25), -50);
  });
  test("a 20% increase then 20% decrease does not return to the original", () => {
    const increased = 50 * (1 + percentOf(20, 1));
    const afterDecrease = increased * (1 - percentOf(20, 1));
    assert.notEqual(afterDecrease, 50);
    assert.ok(Math.abs(afterDecrease - 48) < 1e-9);
  });
  test("division by zero 'from' returns NaN", () => {
    assert.ok(Number.isNaN(percentChange(0, 10)));
  });
});

describe("formatPercentResult", () => {
  test("handles non-finite input", () => {
    assert.equal(formatPercentResult(NaN), "—");
  });
});
