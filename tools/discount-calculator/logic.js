/** Discount math: forward (price + %  final price), reverse (final price + %  original price), and stacked successive discounts. */

/** @param {number} originalPrice @param {number} discountPercent @returns {{ finalPrice: number, amountSaved: number }} */
export function applyDiscount(originalPrice, discountPercent) {
  if (!Number.isFinite(originalPrice) || !Number.isFinite(discountPercent)) {
    return { finalPrice: NaN, amountSaved: NaN };
  }
  const amountSaved = originalPrice * (discountPercent / 100);
  return { finalPrice: originalPrice - amountSaved, amountSaved };
}

/** Reverses a single discount: given the price you actually paid, finds the original (pre-discount) price. */
export function findOriginalPrice(finalPrice, discountPercent) {
  if (!Number.isFinite(finalPrice) || !Number.isFinite(discountPercent) || discountPercent >= 100) return NaN;
  return finalPrice / (1 - discountPercent / 100);
}

/**
 * Applies successive discounts in order (e.g. 20% off, then an extra 10%
 * off the already-discounted price) — NOT the same as adding the
 * percentages together, which is a common and wrong assumption ("20% + 10%
 * off" is not 30% off).
 * @param {number} originalPrice
 * @param {number[]} discountPercents
 * @returns {{ finalPrice: number, amountSaved: number, effectivePercent: number }}
 */
export function applyStackedDiscounts(originalPrice, discountPercents) {
  if (!Number.isFinite(originalPrice)) return { finalPrice: NaN, amountSaved: NaN, effectivePercent: NaN };
  let price = originalPrice;
  for (const percent of discountPercents) {
    if (!Number.isFinite(percent)) return { finalPrice: NaN, amountSaved: NaN, effectivePercent: NaN };
    price -= price * (percent / 100);
  }
  const amountSaved = originalPrice - price;
  const effectivePercent = originalPrice === 0 ? 0 : (amountSaved / originalPrice) * 100;
  return { finalPrice: price, amountSaved, effectivePercent };
}

export function formatMoney(value) {
  if (!Number.isFinite(value)) return "—";
  return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
