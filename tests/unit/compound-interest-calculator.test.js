import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { COMPOUNDING_OPTIONS, calculateCompoundInterest, effectiveAnnualRate, formatMoney } from "../../tools/compound-interest-calculator/logic.js";

describe("calculateCompoundInterest", () => {
  test("annual compounding for 1 year matches simple growth", () => {
    const result = calculateCompoundInterest(1000, 10, 1, "annually");
    assert.ok(Math.abs(result.totalAmount - 1100) < 1e-9);
  });
  test("more frequent compounding earns more than annual, same nominal rate", () => {
    const annual = calculateCompoundInterest(10000, 5, 10, "annually").totalAmount;
    const monthly = calculateCompoundInterest(10000, 5, 10, "monthly").totalAmount;
    const daily = calculateCompoundInterest(10000, 5, 10, "daily").totalAmount;
    assert.ok(monthly > annual);
    assert.ok(daily > monthly, "daily compounding should earn at least as much as monthly");
  });
  test("0 years returns the principal unchanged", () => {
    assert.ok(Math.abs(calculateCompoundInterest(5000, 5, 0, "monthly").totalAmount - 5000) < 1e-9);
  });
  test("0% rate earns nothing regardless of frequency", () => {
    assert.ok(Math.abs(calculateCompoundInterest(5000, 0, 10, "daily").totalAmount - 5000) < 1e-6);
  });
  test("interestEarned is totalAmount minus principal", () => {
    const result = calculateCompoundInterest(2000, 7, 3, "quarterly");
    assert.ok(Math.abs(result.interestEarned - (result.totalAmount - 2000)) < 1e-9);
  });
  test("rejects an unknown compounding frequency", () => {
    assert.ok(Number.isNaN(calculateCompoundInterest(1000, 5, 1, "hourly").totalAmount));
  });
});

describe("effectiveAnnualRate", () => {
  test("equals the nominal rate exactly when compounding annually", () => {
    assert.ok(Math.abs(effectiveAnnualRate(5, "annually") - 5) < 1e-9);
  });
  test("is greater than the nominal rate for any more-frequent compounding", () => {
    for (const option of COMPOUNDING_OPTIONS.filter((o) => o.id !== "annually")) {
      assert.ok(effectiveAnnualRate(5, option.id) > 5, `${option.id} should exceed the nominal rate`);
    }
  });
});

describe("formatMoney", () => {
  test("handles non-finite input", () => {
    assert.equal(formatMoney(NaN), "—");
  });
});
