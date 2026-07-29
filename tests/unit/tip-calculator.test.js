import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { calculateTip, formatMoney } from "../../tools/tip-calculator/logic.js";

describe("calculateTip", () => {
  test("$50 bill, 20% tip, 1 person", () => {
    const result = calculateTip(50, 20, 1);
    assert.equal(result.tipAmount, 10);
    assert.equal(result.totalAmount, 60);
    assert.equal(result.perPersonTotal, 60);
  });
  test("splits evenly between 4 people", () => {
    const result = calculateTip(100, 20, 4);
    assert.equal(result.totalAmount, 120);
    assert.equal(result.perPersonTotal, 30);
    assert.equal(result.perPersonTip, 5);
  });
  test("0% tip still splits the bill", () => {
    const result = calculateTip(40, 0, 2);
    assert.equal(result.tipAmount, 0);
    assert.equal(result.perPersonTotal, 20);
  });
  test("rejects fewer than 1 person", () => {
    assert.ok(Number.isNaN(calculateTip(50, 20, 0).totalAmount));
  });
  test("handles non-finite input", () => {
    assert.ok(Number.isNaN(calculateTip(NaN, 20, 1).totalAmount));
  });
});

describe("formatMoney", () => {
  test("always shows two decimal places", () => {
    assert.equal(formatMoney(12), "12.00");
  });
});
