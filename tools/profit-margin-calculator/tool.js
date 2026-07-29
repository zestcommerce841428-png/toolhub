import { calculateMargin, priceForTargetMargin, formatMoney } from "./logic.js";

const costInput = document.getElementById("margin-cost");
const priceInput = document.getElementById("margin-price");
const profitEl = document.getElementById("margin-profit");
const marginPercentEl = document.getElementById("margin-percent");
const markupPercentEl = document.getElementById("margin-markup-percent");

function renderMargin() {
  const { profit, marginPercent, markupPercent } = calculateMargin(Number(costInput.value), Number(priceInput.value));
  profitEl.textContent = formatMoney(profit);
  marginPercentEl.textContent = Number.isFinite(marginPercent) ? `${marginPercent.toFixed(2)}%` : "—";
  markupPercentEl.textContent = Number.isFinite(markupPercent) ? `${markupPercent.toFixed(2)}%` : "—";
}
[costInput, priceInput].forEach((input) => input.addEventListener("input", renderMargin));
renderMargin();

const targetCostInput = document.getElementById("margin-target-cost");
const targetPercentInput = document.getElementById("margin-target-percent");
const targetPriceEl = document.getElementById("margin-target-price");

function renderTarget() {
  const price = priceForTargetMargin(Number(targetCostInput.value), Number(targetPercentInput.value));
  targetPriceEl.textContent = formatMoney(price);
}
[targetCostInput, targetPercentInput].forEach((input) => input.addEventListener("input", renderTarget));
renderTarget();
