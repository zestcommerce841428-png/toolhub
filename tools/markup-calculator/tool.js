import { priceFromMarkup, markupFromPrices, markupToMargin, formatMoney } from "./logic.js";

const costInput = document.getElementById("markup-cost");
const percentInput = document.getElementById("markup-percent");
const priceEl = document.getElementById("markup-price");
const profitEl = document.getElementById("markup-profit");
const equivMarginEl = document.getElementById("markup-equiv-margin");

function renderForward() {
  const { sellingPrice, profit } = priceFromMarkup(Number(costInput.value), Number(percentInput.value));
  priceEl.textContent = formatMoney(sellingPrice);
  profitEl.textContent = formatMoney(profit);
  const margin = markupToMargin(Number(percentInput.value));
  equivMarginEl.textContent = Number.isFinite(margin) ? `${margin.toFixed(2)}%` : "—";
}
[costInput, percentInput].forEach((input) => input.addEventListener("input", renderForward));
renderForward();

const reverseCostInput = document.getElementById("markup-reverse-cost");
const reversePriceInput = document.getElementById("markup-reverse-price");
const reversePercentEl = document.getElementById("markup-reverse-percent");

function renderReverse() {
  const markup = markupFromPrices(Number(reverseCostInput.value), Number(reversePriceInput.value));
  reversePercentEl.textContent = Number.isFinite(markup) ? `${markup.toFixed(2)}%` : "—";
}
[reverseCostInput, reversePriceInput].forEach((input) => input.addEventListener("input", renderReverse));
renderReverse();
