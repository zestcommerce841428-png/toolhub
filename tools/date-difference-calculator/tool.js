import { calculateDateDifference } from "./logic.js";
import { pluralize } from "/assets/js/core/utility.js";

const inputA = document.getElementById("datediff-a");
const inputB = document.getElementById("datediff-b");
const errorBox = document.getElementById("datediff-error");
const headlineEl = document.getElementById("datediff-headline");
const totalDaysEl = document.getElementById("datediff-total-days");
const totalWeeksEl = document.getElementById("datediff-total-weeks");

function todayDateOnlyString() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

inputA.value = todayDateOnlyString();
inputB.value = todayDateOnlyString();

function render() {
  if (!inputA.value || !inputB.value) return;
  const result = calculateDateDifference(inputA.value, inputB.value);
  if (!result.ok) {
    errorBox.textContent = result.error;
    errorBox.classList.remove("hidden");
    headlineEl.textContent = "—";
    totalDaysEl.textContent = "—";
    totalWeeksEl.textContent = "—";
    return;
  }
  errorBox.classList.add("hidden");

  if (result.isSameDay) {
    headlineEl.textContent = "Same date";
  } else {
    const parts = [];
    if (result.years > 0) parts.push(pluralize(result.years, "year"));
    if (result.months > 0) parts.push(pluralize(result.months, "month"));
    if (result.days > 0 || parts.length === 0) parts.push(pluralize(result.days, "day"));
    headlineEl.textContent = parts.join(", ");
  }

  totalDaysEl.textContent = pluralize(result.totalDays, "day");
  totalWeeksEl.textContent = pluralize(result.totalWeeks, "week");
}

[inputA, inputB].forEach((input) => input.addEventListener("input", render));
render();
