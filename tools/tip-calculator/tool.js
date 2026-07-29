import { calculateTip, formatMoney } from "./logic.js";

const billInput = document.getElementById("tip-bill");
const peopleInput = document.getElementById("tip-people");
const percentSlider = document.getElementById("tip-percent");
const percentValue = document.getElementById("tip-percent-value");

const tipAmountEl = document.getElementById("tip-amount");
const tipTotalEl = document.getElementById("tip-total");
const perPersonTipEl = document.getElementById("tip-per-person-tip");
const perPersonTotalEl = document.getElementById("tip-per-person-total");

function render() {
  percentValue.textContent = percentSlider.value;
  const people = Math.max(1, Math.round(Number(peopleInput.value)) || 1);
  const { tipAmount, totalAmount, perPersonTotal, perPersonTip } = calculateTip(
    Number(billInput.value),
    Number(percentSlider.value),
    people
  );
  tipAmountEl.textContent = formatMoney(tipAmount);
  tipTotalEl.textContent = formatMoney(totalAmount);
  perPersonTipEl.textContent = formatMoney(perPersonTip);
  perPersonTotalEl.textContent = formatMoney(perPersonTotal);
}

billInput.addEventListener("input", render);
peopleInput.addEventListener("input", render);
percentSlider.addEventListener("input", render);

document.querySelectorAll("[data-tip-preset]").forEach((button) => {
  button.addEventListener("click", () => {
    percentSlider.value = button.dataset.tipPreset;
    render();
  });
});

render();
