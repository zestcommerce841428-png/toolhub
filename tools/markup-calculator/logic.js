/**
 * Markup math — profit as a percentage of COST, the mirror of margin (see
 * tools/profit-margin-calculator/logic.js, which is profit as a
 * percentage of selling price). Kept as a separate tool rather than a
 * second mode on the margin calculator because the primary real-world
 * workflow here runs the opposite direction: "I know my cost and the
 * markup I want to apply — what do I charge?"
 */

/** @param {number} cost @param {number} markupPercent @returns {{ sellingPrice: number, profit: number }} */
export function priceFromMarkup(cost, markupPercent) {
  if (!Number.isFinite(cost) || !Number.isFinite(markupPercent)) return { sellingPrice: NaN, profit: NaN };
  const sellingPrice = cost * (1 + markupPercent / 100);
  return { sellingPrice, profit: sellingPrice - cost };
}

/** Given cost and selling price actually charged, finds the markup percentage that was applied. */
export function markupFromPrices(cost, sellingPrice) {
  if (!Number.isFinite(cost) || !Number.isFinite(sellingPrice) || cost === 0) return NaN;
  return ((sellingPrice - cost) / cost) * 100;
}

/** The equivalent margin percentage (profit / selling price) for a given markup — the two are only equal at 0%. */
export function markupToMargin(markupPercent) {
  if (!Number.isFinite(markupPercent)) return NaN;
  return (markupPercent / (100 + markupPercent)) * 100;
}

export function formatMoney(value) {
  if (!Number.isFinite(value)) return "—";
  return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
