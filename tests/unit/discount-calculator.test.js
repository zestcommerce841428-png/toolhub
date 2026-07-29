import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { applyDiscount, findOriginalPrice, applyStackedDiscounts, formatMoney } from "../../tools/discount-calculator/logic.js";

describe("applyDiscount", () => {
  test("20% off $100 is $80, saving $20", () => {
    const result = applyDiscount(100, 20);
    assert.equal(result.finalPrice, 80);
    assert.equal(result.amountSaved, 20);
  });
  test("0% off changes nothing", () => {
    assert.equal(applyDiscount(50, 0).finalPrice, 50);
  });
});

describe("findOriginalPrice", () => {
  test("reverses a 20% discount: $80 paid -> $100 original", () => {
    assert.ok(Math.abs(findOriginalPrice(80, 20) - 100) < 1e-9);
  });
  test("round-trips with applyDiscount", () => {
    const { finalPrice } = applyDiscount(149.99, 33);
    assert.ok(Math.abs(findOriginalPrice(finalPrice, 33) - 149.99) < 1e-6);
  });
  test("returns NaN for a 100%+ discount (undefined original price)", () => {
    assert.ok(Number.isNaN(findOriginalPrice(80, 100)));
  });
});

describe("applyStackedDiscounts", () => {
  test("20% then 10% off $100 is $72, not $70 (not additive)", () => {
    const result = applyStackedDiscounts(100, [20, 10]);
    assert.ok(Math.abs(result.finalPrice - 72) < 1e-9);
    assert.ok(Math.abs(result.effectivePercent - 28) < 1e-9);
  });
  test("empty discount list changes nothing", () => {
    assert.equal(applyStackedDiscounts(100, []).finalPrice, 100);
  });
  test("single discount matches applyDiscount", () => {
    const stacked = applyStackedDiscounts(100, [15]);
    const single = applyDiscount(100, 15);
    assert.ok(Math.abs(stacked.finalPrice - single.finalPrice) < 1e-9);
  });
});

describe("formatMoney", () => {
  test("always shows two decimal places", () => {
    assert.equal(formatMoney(5), "5.00");
  });
  test("handles non-finite input", () => {
    assert.equal(formatMoney(NaN), "—");
  });
});
