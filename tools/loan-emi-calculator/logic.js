/**
 * Standard reducing-balance EMI (equated monthly installment) formula, the
 * same one used for mortgages, auto loans, and personal loans:
 *   EMI = P × r × (1+r)^n / ((1+r)^n − 1)
 * where P is principal, r is the *monthly* interest rate (annual rate /
 * 12 / 100), and n is the number of monthly payments.
 */

/**
 * @param {number} principal
 * @param {number} annualRatePercent
 * @param {number} tenureMonths
 * @returns {{ monthlyPayment: number, totalPayment: number, totalInterest: number }}
 */
export function calculateEmi(principal, annualRatePercent, tenureMonths) {
  if (
    !Number.isFinite(principal) ||
    !Number.isFinite(annualRatePercent) ||
    !Number.isFinite(tenureMonths) ||
    principal <= 0 ||
    tenureMonths <= 0
  ) {
    return { monthlyPayment: NaN, totalPayment: NaN, totalInterest: NaN };
  }

  const monthlyRate = annualRatePercent / 12 / 100;

  // A 0% loan is a valid edge case (some promotional financing) where the
  // formula's denominator would be 0/0 — handle it as a plain even split.
  let monthlyPayment;
  if (monthlyRate === 0) {
    monthlyPayment = principal / tenureMonths;
  } else {
    const growth = (1 + monthlyRate) ** tenureMonths;
    monthlyPayment = (principal * monthlyRate * growth) / (growth - 1);
  }

  const totalPayment = monthlyPayment * tenureMonths;
  return { monthlyPayment, totalPayment, totalInterest: totalPayment - principal };
}

/**
 * Builds a month-by-month amortization schedule (principal vs. interest
 * split of each payment, and the remaining balance) — the reducing-balance
 * structure means the interest portion shrinks and the principal portion
 * grows every month, which isn't visible from the EMI total alone.
 * @param {number} principal
 * @param {number} annualRatePercent
 * @param {number} tenureMonths
 * @returns {Array<{ month: number, payment: number, principalPaid: number, interestPaid: number, balance: number }>}
 */
export function buildAmortizationSchedule(principal, annualRatePercent, tenureMonths) {
  const { monthlyPayment } = calculateEmi(principal, annualRatePercent, tenureMonths);
  if (!Number.isFinite(monthlyPayment)) return [];

  const monthlyRate = annualRatePercent / 12 / 100;
  const schedule = [];
  let balance = principal;

  for (let month = 1; month <= tenureMonths; month++) {
    const interestPaid = balance * monthlyRate;
    // The final payment absorbs any leftover cent-level rounding so the
    // balance always reaches exactly 0 rather than drifting.
    const principalPaid = month === tenureMonths ? balance : monthlyPayment - interestPaid;
    balance = Math.max(0, balance - principalPaid);
    schedule.push({ month, payment: principalPaid + interestPaid, principalPaid, interestPaid, balance });
  }
  return schedule;
}

export function formatMoney(value) {
  if (!Number.isFinite(value)) return "—";
  return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
