/** Tip + bill-splitting math. */

/**
 * @param {number} billAmount
 * @param {number} tipPercent
 * @param {number} peopleCount
 * @returns {{ tipAmount: number, totalAmount: number, perPersonTotal: number, perPersonTip: number }}
 */
export function calculateTip(billAmount, tipPercent, peopleCount) {
  if (!Number.isFinite(billAmount) || !Number.isFinite(tipPercent) || !Number.isFinite(peopleCount) || peopleCount < 1) {
    return { tipAmount: NaN, totalAmount: NaN, perPersonTotal: NaN, perPersonTip: NaN };
  }
  const tipAmount = billAmount * (tipPercent / 100);
  const totalAmount = billAmount + tipAmount;
  return {
    tipAmount,
    totalAmount,
    perPersonTotal: totalAmount / peopleCount,
    perPersonTip: tipAmount / peopleCount,
  };
}

export function formatMoney(value) {
  if (!Number.isFinite(value)) return "—";
  return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
