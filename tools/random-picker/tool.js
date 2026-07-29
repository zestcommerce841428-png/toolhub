import { parseItems, pickRandom, splitIntoTeams } from "./logic.js";
import { escapeHtml } from "/assets/js/core/utility.js";

const itemsInput = document.getElementById("picker-items");

document.getElementById("picker-pick").addEventListener("click", () => {
  const errorBox = document.getElementById("picker-pick-error");
  const resultBox = document.getElementById("picker-pick-result");
  const count = Math.round(Number(document.getElementById("picker-count").value)) || 0;

  const result = pickRandom(parseItems(itemsInput.value), count);
  if (!result.ok) {
    errorBox.textContent = result.error;
    errorBox.classList.remove("hidden");
    resultBox.innerHTML = "";
    return;
  }
  errorBox.classList.add("hidden");
  resultBox.innerHTML = result.picked
    .map((item, index) => `<span class="badge text-base"><strong class="mr-1">${index + 1}.</strong> ${escapeHtml(item)}</span>`)
    .join("");
});

document.getElementById("picker-split").addEventListener("click", () => {
  const errorBox = document.getElementById("picker-split-error");
  const resultBox = document.getElementById("picker-split-result");
  const teamCount = Math.round(Number(document.getElementById("picker-teams").value)) || 0;

  const result = splitIntoTeams(parseItems(itemsInput.value), teamCount);
  if (!result.ok) {
    errorBox.textContent = result.error;
    errorBox.classList.remove("hidden");
    resultBox.innerHTML = "";
    return;
  }
  errorBox.classList.add("hidden");
  resultBox.innerHTML = result.teams
    .map(
      (team, index) => `
      <div class="card">
        <h3 class="mb-2 text-sm font-semibold text-text">Team ${index + 1}</h3>
        <ul class="space-y-1 text-sm text-text-muted">
          ${team.map((member) => `<li>${escapeHtml(member)}</li>`).join("")}
        </ul>
      </div>`
    )
    .join("");
});
