import { addBusinessDays, countBusinessDaysBetween } from "./logic.js";
import { pluralize } from "/assets/js/core/utility.js";

const holidaysInput = document.getElementById("bdays-holidays");

function parseHolidays() {
  return holidaysInput.value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function todayDateOnlyString() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

// --- Add business days ---
const startInput = document.getElementById("bdays-start");
const countInput = document.getElementById("bdays-count");
const resultEl = document.getElementById("bdays-result");

function renderAdd() {
  const result = addBusinessDays(startInput.value, Math.round(Number(countInput.value)) || 0, parseHolidays());
  resultEl.textContent = result.ok ? result.date : "—";
}
startInput.value = todayDateOnlyString();
[startInput, countInput].forEach((el) => el.addEventListener("input", renderAdd));

// --- Count between ---
const rangeStartInput = document.getElementById("bdays-range-start");
const rangeEndInput = document.getElementById("bdays-range-end");
const rangeBusinessEl = document.getElementById("bdays-range-business");
const rangeTotalEl = document.getElementById("bdays-range-total");

function renderCount() {
  if (!rangeStartInput.value || !rangeEndInput.value) return;
  const result = countBusinessDaysBetween(rangeStartInput.value, rangeEndInput.value, parseHolidays());
  rangeBusinessEl.textContent = result.ok ? pluralize(result.businessDays, "day") : "—";
  rangeTotalEl.textContent = result.ok ? pluralize(result.totalDays, "day") : "—";
}
rangeStartInput.value = todayDateOnlyString();
rangeEndInput.value = todayDateOnlyString();
[rangeStartInput, rangeEndInput].forEach((el) => el.addEventListener("input", renderCount));

holidaysInput.addEventListener("input", () => {
  renderAdd();
  renderCount();
});

renderAdd();
renderCount();
