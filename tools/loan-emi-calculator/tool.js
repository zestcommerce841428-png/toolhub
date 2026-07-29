import { calculateEmi, buildAmortizationSchedule, formatMoney } from "./logic.js";

const principalInput = document.getElementById("emi-principal");
const rateInput = document.getElementById("emi-rate");
const tenureInput = document.getElementById("emi-tenure");
const tenureUnitSelect = document.getElementById("emi-tenure-unit");

const paymentEl = document.getElementById("emi-payment");
const interestEl = document.getElementById("emi-interest");
const totalEl = document.getElementById("emi-total");
const scheduleBody = document.getElementById("emi-schedule-body");

function tenureInMonths() {
  const value = Math.round(Number(tenureInput.value));
  return tenureUnitSelect.value === "years" ? value * 12 : value;
}

function render() {
  const principal = Number(principalInput.value);
  const rate = Number(rateInput.value);
  const months = tenureInMonths();

  const { monthlyPayment, totalPayment, totalInterest } = calculateEmi(principal, rate, months);
  paymentEl.textContent = formatMoney(monthlyPayment);
  interestEl.textContent = formatMoney(totalInterest);
  totalEl.textContent = formatMoney(totalPayment);

  const schedule = buildAmortizationSchedule(principal, rate, months);
  scheduleBody.innerHTML = schedule
    .map(
      (row) => `
      <tr class="border-t border-border">
        <td class="py-1 pr-3">${row.month}</td>
        <td class="py-1 pr-3">${formatMoney(row.payment)}</td>
        <td class="py-1 pr-3">${formatMoney(row.principalPaid)}</td>
        <td class="py-1 pr-3">${formatMoney(row.interestPaid)}</td>
        <td class="py-1">${formatMoney(row.balance)}</td>
      </tr>`
    )
    .join("");
}

[principalInput, rateInput, tenureInput, tenureUnitSelect].forEach((input) => input.addEventListener("input", render));
render();
