import { applyStackedDiscounts, findOriginalPrice, formatMoney } from "./logic.js";

const priceInput = document.getElementById("disc-price");
const percentInputs = ["disc-percent-1", "disc-percent-2", "disc-percent-3"].map((id) => document.getElementById(id));
const finalPriceEl = document.getElementById("disc-final-price");
const amountSavedEl = document.getElementById("disc-amount-saved");
const effectivePercentEl = document.getElementById("disc-effective-percent");

function renderForward() {
  const price = Number(priceInput.value);
  const percents = percentInputs.map((input) => Number(input.value)).filter((percent) => percent > 0);
  const { finalPrice, amountSaved, effectivePercent } = applyStackedDiscounts(price, percents);

  finalPriceEl.textContent = Number.isFinite(finalPrice) ? formatMoney(finalPrice) : "—";
  amountSavedEl.textContent = Number.isFinite(amountSaved) ? formatMoney(amountSaved) : "—";
  effectivePercentEl.textContent = Number.isFinite(effectivePercent) ? `${effectivePercent.toFixed(2)}%` : "—";
}

[priceInput, ...percentInputs].forEach((input) => input.addEventListener("input", renderForward));
renderForward();

const reverseFinalInput = document.getElementById("disc-reverse-final");
const reversePercentInput = document.getElementById("disc-reverse-percent");
const reverseOriginalEl = document.getElementById("disc-reverse-original");

function renderReverse() {
  const original = findOriginalPrice(Number(reverseFinalInput.value), Number(reversePercentInput.value));
  reverseOriginalEl.textContent = formatMoney(original);
}

[reverseFinalInput, reversePercentInput].forEach((input) => input.addEventListener("input", renderReverse));
renderReverse();
