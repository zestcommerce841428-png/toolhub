import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { priceFromMarkup, markupFromPrices, markupToMargin, formatMoney } from "../../tools/markup-calculator/logic.js";

describe("priceFromMarkup", () => {
  test("$40 cost with 50% markup is $60", () => {
    const result = priceFromMarkup(40, 50);
    assert.equal(result.sellingPrice, 60);
    assert.equal(result.profit, 20);
  });
  test("0% markup returns the cost unchanged", () => {
    assert.equal(priceFromMarkup(40, 0).sellingPrice, 40);
  });
});

describe("markupFromPrices", () => {
  test("reverses priceFromMarkup", () => {
    assert.ok(Math.abs(markupFromPrices(40, 60) - 50) < 1e-9);
  });
  test("selling at cost is 0% markup", () => {
    assert.equal(markupFromPrices(50, 50), 0);
  });
  test("handles zero cost without producing Infinity", () => {
    assert.ok(Number.isNaN(markupFromPrices(0, 50)));
  });
});

describe("markupToMargin", () => {
  test("50% markup is 33.3% margin, not 50% margin", () => {
    const margin = markupToMargin(50);
    assert.ok(Math.abs(margin - 33.3333) < 0.001);
    assert.notEqual(margin, 50);
  });
  test("0% markup is 0% margin (the only point where they're equal)", () => {
    assert.equal(markupToMargin(0), 0);
  });
  test("100% markup is 50% margin", () => {
    assert.equal(markupToMargin(100), 50);
  });
});

describe("formatMoney", () => {
  test("handles non-finite input", () => {
    assert.equal(formatMoney(NaN), "—");
  });
});
