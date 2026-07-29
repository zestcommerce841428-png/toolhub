import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { calculateSimpleInterest, toYears, formatMoney } from "../../tools/simple-interest-calculator/logic.js";

describe("calculateSimpleInterest", () => {
  test("$10,000 at 5% for 2 years", () => {
    const result = calculateSimpleInterest(10000, 5, 2);
    assert.equal(result.interest, 1000);
    assert.equal(result.totalAmount, 11000);
  });
  test("0% rate earns nothing", () => {
    assert.equal(calculateSimpleInterest(1000, 0, 5).interest, 0);
  });
  test("0 time earns nothing", () => {
    assert.equal(calculateSimpleInterest(1000, 5, 0).interest, 0);
  });
  test("handles non-finite input", () => {
    assert.ok(Number.isNaN(calculateSimpleInterest(NaN, 5, 2).interest));
  });
});

describe("toYears", () => {
  test("12 months is 1 year", () => {
    assert.equal(toYears(12, "months"), 1);
  });
  test("365 days is 1 year", () => {
    assert.equal(toYears(365, "days"), 1);
  });
  test("years pass through unchanged", () => {
    assert.equal(toYears(3, "years"), 3);
  });
});

describe("formatMoney", () => {
  test("handles non-finite input", () => {
    assert.equal(formatMoney(NaN), "—");
  });
});
