import { CATEGORIES, searchStatusCodes } from "./logic.js";
import { escapeHtml, debounce, pluralize } from "/assets/js/core/utility.js";

const searchInput = document.getElementById("status-search");
const categorySelect = document.getElementById("status-category");
const countEl = document.getElementById("status-count");
const resultsEl = document.getElementById("status-results");

const CATEGORY_COLOR = {
  Informational: "text-info",
  Success: "text-success",
  Redirection: "text-warning",
  "Client Error": "text-danger",
  "Server Error": "text-danger",
};

categorySelect.innerHTML += CATEGORIES.map((category) => `<option value="${category}">${category}</option>`).join("");

function render() {
  const results = searchStatusCodes(searchInput.value, categorySelect.value);
  countEl.textContent = `${results.length} ${pluralize(results.length, "code")}`;

  resultsEl.innerHTML = results
    .map(
      (entry) => `
      <div class="card flex items-start gap-4">
        <span class="font-mono text-lg font-bold ${CATEGORY_COLOR[entry.category]}">${entry.code}</span>
        <div class="min-w-0">
          <p class="font-semibold text-text">${escapeHtml(entry.name)} <span class="badge ml-1">${escapeHtml(entry.category)}</span></p>
          <p class="mt-1 text-sm text-text-muted">${escapeHtml(entry.description)}</p>
        </div>
      </div>`
    )
    .join("");
}

searchInput.addEventListener("input", debounce(render, 100));
categorySelect.addEventListener("change", render);

render();
