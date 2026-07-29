import { calculateSimpleInterest, toYears, formatMoney } from "./logic.js";

const principalInput = document.getElementById("si-principal");
const rateInput = document.getElementById("si-rate");
const timeInput = document.getElementById("si-time");
const timeUnitSelect = document.getElementById("si-time-unit");

const interestEl = document.getElementById("si-interest");
const totalEl = document.getElementById("si-total");
const principalEchoEl = document.getElementById("si-principal-echo");

function render() {
  const principal = Number(principalInput.value);
  const years = toYears(Number(timeInput.value), timeUnitSelect.value);
  const { interest, totalAmount } = calculateSimpleInterest(principal, Number(rateInput.value), years);

  interestEl.textContent = formatMoney(interest);
  totalEl.textContent = formatMoney(totalAmount);
  principalEchoEl.textContent = formatMoney(principal);
}

[principalInput, rateInput, timeInput, timeUnitSelect].forEach((input) => input.addEventListener("input", render));
render();
