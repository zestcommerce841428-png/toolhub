import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { calculateMargin, priceForTargetMargin, formatMoney } from "../../tools/profit-margin-calculator/logic.js";

describe("calculateMargin", () => {
  test("$40 cost, $60 price: 33.3% margin, 50% markup", () => {
    const result = calculateMargin(40, 60);
    assert.equal(result.profit, 20);
    assert.ok(Math.abs(result.marginPercent - 33.3333) < 0.001);
    assert.equal(result.markupPercent, 50);
  });
  test("margin and markup are genuinely different numbers for the same sale", () => {
    const result = calculateMargin(40, 60);
    assert.notEqual(result.marginPercent, result.markupPercent);
  });
  test("selling at cost is 0% margin and 0% markup", () => {
    const result = calculateMargin(50, 50);
    assert.equal(result.marginPercent, 0);
    assert.equal(result.markupPercent, 0);
  });
  test("selling below cost is a negative margin", () => {
    assert.ok(calculateMargin(50, 40).marginPercent < 0);
  });
  test("handles a zero selling price without producing Infinity", () => {
    assert.ok(Number.isNaN(calculateMargin(10, 0).marginPercent));
  });
});

describe("priceForTargetMargin", () => {
  test("round-trips with calculateMargin", () => {
    const price = priceForTargetMargin(40, 33.3333333);
    const result = calculateMargin(40, price);
    assert.ok(Math.abs(result.marginPercent - 33.3333333) < 0.001);
  });
  test("rejects a margin of 100% or more (undefined price)", () => {
    assert.ok(Number.isNaN(priceForTargetMargin(40, 100)));
  });
});

describe("formatMoney", () => {
  test("handles non-finite input", () => {
    assert.equal(formatMoney(NaN), "—");
  });
});
