/** Three independent percentage operations — deliberately not one "calculate" function, since each answers a genuinely different question. */

/** "X% of Y" — e.g. 20% of 50 = 10. */
export function percentOf(percent, base) {
  if (!Number.isFinite(percent) || !Number.isFinite(base)) return NaN;
  return (percent / 100) * base;
}

/** "X is what % of Y" — e.g. 10 is what % of 50 = 20%. */
export function whatPercent(part, whole) {
  if (!Number.isFinite(part) || !Number.isFinite(whole) || whole === 0) return NaN;
  return (part / whole) * 100;
}

/** "% change from X to Y" — positive is an increase, negative is a decrease. */
export function percentChange(from, to) {
  if (!Number.isFinite(from) || !Number.isFinite(to) || from === 0) return NaN;
  return ((to - from) / Math.abs(from)) * 100;
}

/** Formats a percentage-calculator result for display: fewer decimals for round numbers. */
export function formatPercentResult(value) {
  if (!Number.isFinite(value)) return "—";
  return value.toLocaleString(undefined, { maximumFractionDigits: 4 });
}
