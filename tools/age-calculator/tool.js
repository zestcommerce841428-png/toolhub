import { calculateAge } from "./logic.js";
import { pluralize } from "/assets/js/core/utility.js";

const birthDateInput = document.getElementById("age-birth-date");
const asOfDateInput = document.getElementById("age-as-of-date");
const errorEl = document.getElementById("age-error");
const resultEl = document.getElementById("age-result");
const totalDaysEl = document.getElementById("age-total-days");
const nextBirthdayEl = document.getElementById("age-next-birthday");

function todayAsDateInputValue() {
  const now = new Date();
  const localMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return localMidnight.toISOString().slice(0, 10);
}

function formatDateForDisplay(isoDateStr) {
  return new Date(`${isoDateStr}T00:00:00`).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function render() {
  if (!birthDateInput.value || !asOfDateInput.value) {
    errorEl.classList.add("hidden");
    resultEl.textContent = "—";
    totalDaysEl.textContent = "";
    nextBirthdayEl.textContent = "—";
    return;
  }

  const result = calculateAge(birthDateInput.value, asOfDateInput.value);

  if (!result.ok) {
    errorEl.textContent = result.error;
    errorEl.classList.remove("hidden");
    resultEl.textContent = "—";
    totalDaysEl.textContent = "";
    nextBirthdayEl.textContent = "—";
    return;
  }

  errorEl.classList.add("hidden");
  resultEl.textContent = `${result.years} ${result.years === 1 ? "year" : "years"}, ${result.months} ${result.months === 1 ? "month" : "months"}, ${result.days} ${result.days === 1 ? "day" : "days"}`;
  totalDaysEl.textContent = `${pluralize(result.totalDays, "day")} total`;

  nextBirthdayEl.textContent =
    result.nextBirthday.daysUntil === 0
      ? "Today! 🎉"
      : `${formatDateForDisplay(result.nextBirthday.date)} (in ${pluralize(result.nextBirthday.daysUntil, "day")})`;
}

birthDateInput.addEventListener("input", render);
asOfDateInput.addEventListener("input", render);

asOfDateInput.value = todayAsDateInputValue();
render();
