/** Simple interest: I = P × R × T / 100, where R is an annual percentage and T is in years (fractional years allowed, e.g. 0.5 for 6 months). */

/**
 * @param {number} principal
 * @param {number} annualRatePercent
 * @param {number} years
 * @returns {{ interest: number, totalAmount: number }}
 */
export function calculateSimpleInterest(principal, annualRatePercent, years) {
  if (!Number.isFinite(principal) || !Number.isFinite(annualRatePercent) || !Number.isFinite(years)) {
    return { interest: NaN, totalAmount: NaN };
  }
  const interest = (principal * annualRatePercent * years) / 100;
  return { interest, totalAmount: principal + interest };
}

/** Converts a time value in the given unit to fractional years. */
export function toYears(value, unit) {
  if (!Number.isFinite(value)) return NaN;
  if (unit === "months") return value / 12;
  if (unit === "days") return value / 365;
  return value;
}

export function formatMoney(value) {
  if (!Number.isFinite(value)) return "—";
  return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
