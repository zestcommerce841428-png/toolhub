/** Compound interest: A = P(1 + r/n)^(n×t), where r is the annual rate as a decimal, n is compounds per year, t is years. */

export const COMPOUNDING_OPTIONS = [
  { id: "annually", label: "Annually", timesPerYear: 1 },
  { id: "semiannually", label: "Semi-annually", timesPerYear: 2 },
  { id: "quarterly", label: "Quarterly", timesPerYear: 4 },
  { id: "monthly", label: "Monthly", timesPerYear: 12 },
  { id: "daily", label: "Daily", timesPerYear: 365 },
];

const timesPerYearById = new Map(COMPOUNDING_OPTIONS.map((option) => [option.id, option.timesPerYear]));

/**
 * @param {number} principal
 * @param {number} annualRatePercent
 * @param {number} years
 * @param {string} compoundingId - one of COMPOUNDING_OPTIONS ids
 * @returns {{ totalAmount: number, interestEarned: number }}
 */
export function calculateCompoundInterest(principal, annualRatePercent, years, compoundingId) {
  const timesPerYear = timesPerYearById.get(compoundingId);
  if (
    !Number.isFinite(principal) ||
    !Number.isFinite(annualRatePercent) ||
    !Number.isFinite(years) ||
    !timesPerYear ||
    years < 0
  ) {
    return { totalAmount: NaN, interestEarned: NaN };
  }
  const rate = annualRatePercent / 100;
  const totalAmount = principal * (1 + rate / timesPerYear) ** (timesPerYear * years);
  return { totalAmount, interestEarned: totalAmount - principal };
}

/**
 * The annual percentage yield (APY) — the effective annual rate once
 * compounding is accounted for, which is always >= the nominal rate for
 * any compounding frequency more often than annual.
 * @param {number} annualRatePercent
 * @param {string} compoundingId
 * @returns {number} APY as a percentage
 */
export function effectiveAnnualRate(annualRatePercent, compoundingId) {
  const timesPerYear = timesPerYearById.get(compoundingId);
  if (!Number.isFinite(annualRatePercent) || !timesPerYear) return NaN;
  const rate = annualRatePercent / 100;
  return ((1 + rate / timesPerYear) ** timesPerYear - 1) * 100;
}

export function formatMoney(value) {
  if (!Number.isFinite(value)) return "—";
  return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
