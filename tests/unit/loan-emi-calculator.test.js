import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { calculateEmi, buildAmortizationSchedule, formatMoney } from "../../tools/loan-emi-calculator/logic.js";

describe("calculateEmi", () => {
  test("0% interest is a plain even split", () => {
    const result = calculateEmi(12000, 0, 12);
    assert.equal(result.monthlyPayment, 1000);
    assert.ok(Math.abs(result.totalInterest) < 1e-9);
  });
  test("matches the textbook reducing-balance formula directly", () => {
    const principal = 250000;
    const annualRate = 6.5;
    const months = 360;
    const monthlyRate = annualRate / 12 / 100;
    const growth = (1 + monthlyRate) ** months;
    const expectedPayment = (principal * monthlyRate * growth) / (growth - 1);

    const result = calculateEmi(principal, annualRate, months);
    assert.ok(Math.abs(result.monthlyPayment - expectedPayment) < 1e-6);
  });
  test("totalPayment is monthlyPayment times the number of months", () => {
    const result = calculateEmi(10000, 5, 24);
    assert.ok(Math.abs(result.totalPayment - result.monthlyPayment * 24) < 1e-6);
  });
  test("totalInterest is totalPayment minus principal", () => {
    const result = calculateEmi(10000, 5, 24);
    assert.ok(Math.abs(result.totalInterest - (result.totalPayment - 10000)) < 1e-6);
  });
  test("rejects zero or negative principal/tenure", () => {
    assert.ok(Number.isNaN(calculateEmi(0, 5, 12).monthlyPayment));
    assert.ok(Number.isNaN(calculateEmi(1000, 5, 0).monthlyPayment));
  });
});

describe("buildAmortizationSchedule", () => {
  test("has one row per month", () => {
    const schedule = buildAmortizationSchedule(10000, 5, 12);
    assert.equal(schedule.length, 12);
  });
  test("first month's interest equals principal x monthly rate", () => {
    const schedule = buildAmortizationSchedule(10000, 6, 12);
    const monthlyRate = 6 / 12 / 100;
    assert.ok(Math.abs(schedule[0].interestPaid - 10000 * monthlyRate) < 1e-6);
  });
  test("balance reaches exactly 0 after the final payment", () => {
    const schedule = buildAmortizationSchedule(15000, 4.5, 36);
    assert.ok(Math.abs(schedule[schedule.length - 1].balance) < 1e-6);
  });
  test("interest portion shrinks and principal portion grows over time (reducing balance)", () => {
    const schedule = buildAmortizationSchedule(50000, 7, 60);
    assert.ok(schedule[0].interestPaid > schedule[schedule.length - 2].interestPaid);
    assert.ok(schedule[0].principalPaid < schedule[schedule.length - 2].principalPaid);
  });
  test("returns an empty schedule for invalid input", () => {
    assert.deepEqual(buildAmortizationSchedule(0, 5, 12), []);
  });
});

describe("formatMoney", () => {
  test("handles non-finite input", () => {
    assert.equal(formatMoney(NaN), "—");
  });
});
