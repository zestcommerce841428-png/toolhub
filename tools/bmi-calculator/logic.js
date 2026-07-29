/**
 * Pure BMI math and unit conversions — the WHO adult BMI formula and
 * standard weight-status thresholds. Not medical advice; see the tool's
 * FAQ for the usual caveats about BMI as a screening measure.
 */

const CM_PER_INCH = 2.54;
const KG_PER_LB = 0.45359237;

export function feetInchesToCm(feet, inches) {
  return (feet * 12 + inches) * CM_PER_INCH;
}

export function lbsToKg(lbs) {
  return lbs * KG_PER_LB;
}

/**
 * @param {{ heightCm: number, weightKg: number }} input
 * @returns {{ ok: true, bmi: number } | { ok: false, error: string }}
 */
export function calculateBmi({ heightCm, weightKg }) {
  if (!Number.isFinite(heightCm) || heightCm <= 0) {
    return { ok: false, error: "Enter a height greater than zero." };
  }
  if (!Number.isFinite(weightKg) || weightKg <= 0) {
    return { ok: false, error: "Enter a weight greater than zero." };
  }
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  return { ok: true, bmi: Math.round(bmi * 10) / 10 };
}

/**
 * @param {number} bmi
 * @returns {{ category: "Underweight"|"Normal weight"|"Overweight"|"Obese", colorKey: "info"|"success"|"warning"|"danger" }}
 */
export function classifyBmi(bmi) {
  if (bmi < 18.5) return { category: "Underweight", colorKey: "info" };
  if (bmi < 25) return { category: "Normal weight", colorKey: "success" };
  if (bmi < 30) return { category: "Overweight", colorKey: "warning" };
  return { category: "Obese", colorKey: "danger" };
}
