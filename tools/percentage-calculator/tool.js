import { percentOf, whatPercent, percentChange, formatPercentResult } from "./logic.js";

function wireCalc(inputIds, resultId, compute, formatResult) {
  const inputs = inputIds.map((id) => document.getElementById(id));
  const result = document.getElementById(resultId);
  function render() {
    const values = inputs.map((input) => Number(input.value));
    result.textContent = formatResult(compute(...values));
  }
  inputs.forEach((input) => input.addEventListener("input", render));
  render();
}

wireCalc(["pct-of-percent", "pct-of-base"], "pct-of-result", percentOf, (v) => formatPercentResult(v));

wireCalc(["pct-what-part", "pct-what-whole"], "pct-what-result", whatPercent, (v) =>
  Number.isFinite(v) ? `${formatPercentResult(v)}%` : "—"
);

wireCalc(["pct-change-from", "pct-change-to"], "pct-change-result", percentChange, (v) => {
  if (!Number.isFinite(v)) return "—";
  const sign = v > 0 ? "+" : "";
  return `${sign}${formatPercentResult(v)}%`;
});
