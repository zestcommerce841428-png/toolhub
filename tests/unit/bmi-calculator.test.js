import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { calculateBmi, classifyBmi, feetInchesToCm, lbsToKg } from "../../tools/bmi-calculator/logic.js";

describe("calculateBmi", () => {
  test("computes the standard formula", () => {
    // 70kg at 175cm -> 70 / 1.75^2 = 22.857...
    const result = calculateBmi({ heightCm: 175, weightKg: 70 });
    assert.equal(result.ok, true);
    assert.equal(result.bmi, 22.9);
  });

  test("rejects non-positive height or weight", () => {
    assert.equal(calculateBmi({ heightCm: 0, weightKg: 70 }).ok, false);
    assert.equal(calculateBmi({ heightCm: 175, weightKg: -1 }).ok, false);
    assert.equal(calculateBmi({ heightCm: NaN, weightKg: 70 }).ok, false);
  });
});

describe("classifyBmi", () => {
  test("boundaries match the WHO adult thresholds", () => {
    assert.equal(classifyBmi(18.4).category, "Underweight");
    assert.equal(classifyBmi(18.5).category, "Normal weight");
    assert.equal(classifyBmi(24.9).category, "Normal weight");
    assert.equal(classifyBmi(25).category, "Overweight");
    assert.equal(classifyBmi(29.9).category, "Overweight");
    assert.equal(classifyBmi(30).category, "Obese");
  });
});

describe("unit conversions", () => {
  test("feetInchesToCm", () => {
    // 5'7" -> 67 inches -> 170.18cm
    assert.ok(Math.abs(feetInchesToCm(5, 7) - 170.18) < 0.01);
  });
  test("lbsToKg", () => {
    assert.ok(Math.abs(lbsToKg(154) - 69.85) < 0.01);
  });
});
