import { rollDice, summarizeRolls } from "./logic.js";

const countInput = document.getElementById("dice-count");
const sidesSelect = document.getElementById("dice-sides");
const errorBox = document.getElementById("dice-error");
const resultsEl = document.getElementById("dice-results");
const totalEl = document.getElementById("dice-total");

const statCountEl = document.getElementById("dice-stat-count");
const statMinEl = document.getElementById("dice-stat-min");
const statMaxEl = document.getElementById("dice-stat-max");
const statAverageEl = document.getElementById("dice-stat-average");

let history = [];

function renderStats() {
  const summary = summarizeRolls(history);
  statCountEl.textContent = String(summary.count);
  statMinEl.textContent = summary.count > 0 ? String(summary.min) : "—";
  statMaxEl.textContent = summary.count > 0 ? String(summary.max) : "—";
  statAverageEl.textContent = summary.count > 0 ? summary.average.toFixed(2) : "—";
}

document.getElementById("dice-roll").addEventListener("click", () => {
  const count = Math.max(1, Math.round(Number(countInput.value)) || 1);
  const sides = Number(sidesSelect.value);
  const result = rollDice(count, sides);

  if (!result.ok) {
    errorBox.textContent = result.error;
    errorBox.classList.remove("hidden");
    return;
  }
  errorBox.classList.add("hidden");

  resultsEl.innerHTML = result.rolls
    .map((roll) => `<span class="badge text-base font-mono">${roll}</span>`)
    .join("");
  totalEl.textContent = String(result.total);

  history.push(...result.rolls);
  renderStats();
});

document.getElementById("dice-reset").addEventListener("click", () => {
  history = [];
  renderStats();
});

renderStats();
