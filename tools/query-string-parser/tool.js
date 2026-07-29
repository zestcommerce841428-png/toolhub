import { parseQueryString, buildQueryString } from "./logic.js";
import { escapeHtml } from "/assets/js/core/utility.js";
import { bindCopyButton } from "/assets/js/core/clipboard.js";
import { showToast } from "/assets/js/core/toast.js";

// --- Parse section ---
const parseInput = document.getElementById("qs-input");
const parsedBody = document.getElementById("qs-parsed-body");
const parsedEmpty = document.getElementById("qs-parsed-empty");

function renderParsed() {
  const pairs = parseQueryString(parseInput.value);
  parsedEmpty.classList.toggle("hidden", pairs.length > 0);
  parsedBody.innerHTML = pairs
    .map(
      (pair) => `
      <tr class="border-t border-border">
        <td class="py-1 pr-3">${escapeHtml(pair.key)}</td>
        <td class="py-1">${escapeHtml(pair.value)}</td>
      </tr>`
    )
    .join("");
}
parseInput.addEventListener("input", renderParsed);
renderParsed();

// --- Build section ---
const rowsContainer = document.getElementById("qs-build-rows");
const buildOutput = document.getElementById("qs-build-output");

function addRow(key = "", value = "") {
  const row = document.createElement("div");
  row.className = "qs-row flex gap-2";
  row.innerHTML = `
    <input type="text" class="field-input qs-build-key" placeholder="key" value="${escapeHtml(key)}" />
    <input type="text" class="field-input qs-build-value" placeholder="value" value="${escapeHtml(value)}" />
    <button type="button" class="btn-icon border border-border qs-remove-row" aria-label="Remove parameter">×</button>
  `;
  rowsContainer.appendChild(row);
}

function renderBuild() {
  const pairs = [...rowsContainer.querySelectorAll(".qs-row")].map((row) => ({
    key: row.querySelector(".qs-build-key").value,
    value: row.querySelector(".qs-build-value").value,
  }));
  buildOutput.value = buildQueryString(pairs);
}

rowsContainer.addEventListener("input", renderBuild);
rowsContainer.addEventListener("click", (event) => {
  const removeButton = event.target.closest(".qs-remove-row");
  if (removeButton) {
    removeButton.closest(".qs-row").remove();
    renderBuild();
  }
});

document.getElementById("qs-add-row").addEventListener("click", () => {
  addRow();
});

addRow("q", "hello world");
addRow("page", "2");
renderBuild();

bindCopyButton(document.getElementById("qs-build-copy"), () => buildOutput.value, {
  onCopied: (success) => {
    if (!buildOutput.value) return;
    if (!success) showToast("Couldn't copy — try selecting the text manually.", { variant: "danger" });
  },
});
