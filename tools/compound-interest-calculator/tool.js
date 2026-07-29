import { COMPOUNDING_OPTIONS, calculateCompoundInterest, effectiveAnnualRate, formatMoney } from "./logic.js";

const principalInput = document.getElementById("ci-principal");
const rateInput = document.getElementById("ci-rate");
const yearsInput = document.getElementById("ci-years");
const compoundingSelect = document.getElementById("ci-compounding");

const totalEl = document.getElementById("ci-total");
const interestEl = document.getElementById("ci-interest");
const apyEl = document.getElementById("ci-apy");

compoundingSelect.innerHTML = COMPOUNDING_OPTIONS.map(
  (option) => `<option value="${option.id}" ${option.id === "monthly" ? "selected" : ""}>${option.label}</option>`
).join("");

function render() {
  const principal = Number(principalInput.value);
  const rate = Number(rateInput.value);
  const years = Number(yearsInput.value);
  const compoundingId = compoundingSelect.value;

  const { totalAmount, interestEarned } = calculateCompoundInterest(principal, rate, years, compoundingId);
  totalEl.textContent = formatMoney(totalAmount);
  interestEl.textContent = formatMoney(interestEarned);

  const apy = effectiveAnnualRate(rate, compoundingId);
  apyEl.textContent = Number.isFinite(apy) ? `${apy.toFixed(3)}%` : "—";
}

[principalInput, rateInput, yearsInput, compoundingSelect].forEach((input) => input.addEventListener("input", render));
render();
