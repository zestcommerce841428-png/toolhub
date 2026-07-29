/**
 * Profit margin math. Margin is profit as a percentage of the SELLING
 * price (revenue); markup (see tools/markup-calculator/logic.js) is
 * profit as a percentage of COST — the two are easy to conflate but give
 * meaningfully different numbers for the same sale.
 */

/** @param {number} cost @param {number} sellingPrice @returns {{ profit: number, marginPercent: number, markupPercent: number }} */
export function calculateMargin(cost, sellingPrice) {
  if (!Number.isFinite(cost) || !Number.isFinite(sellingPrice) || sellingPrice === 0) {
    return { profit: NaN, marginPercent: NaN, markupPercent: NaN };
  }
  const profit = sellingPrice - cost;
  return {
    profit,
    marginPercent: (profit / sellingPrice) * 100,
    markupPercent: cost === 0 ? NaN : (profit / cost) * 100,
  };
}

/** Given a cost and a target margin (% of selling price), finds the selling price needed to hit it. */
export function priceForTargetMargin(cost, targetMarginPercent) {
  if (!Number.isFinite(cost) || !Number.isFinite(targetMarginPercent) || targetMarginPercent >= 100) return NaN;
  return cost / (1 - targetMarginPercent / 100);
}

export function formatMoney(value) {
  if (!Number.isFinite(value)) return "—";
  return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
