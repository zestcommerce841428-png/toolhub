import { computeLineDiff, summarizeDiff } from "./logic.js";
import { escapeHtml, debounce, pluralize } from "/assets/js/core/utility.js";

const inputA = document.getElementById("diff-input-a");
const inputB = document.getElementById("diff-input-b");
const errorBox = document.getElementById("diff-error");
const summaryEl = document.getElementById("diff-summary");
const outputEl = document.getElementById("diff-output");

const LINE_STYLE = {
  add: { prefix: "+", className: "bg-success/10 text-success" },
  remove: { prefix: "−", className: "bg-danger/10 text-danger" },
  equal: { prefix: " ", className: "text-text-muted" },
};

function render() {
  if (!inputA.value && !inputB.value) {
    errorBox.classList.add("hidden");
    summaryEl.textContent = "";
    outputEl.innerHTML = "";
    return;
  }

  const result = computeLineDiff(inputA.value, inputB.value);
  if (!result.ok) {
    errorBox.textContent = result.error;
    errorBox.classList.remove("hidden");
    summaryEl.textContent = "";
    outputEl.innerHTML = "";
    return;
  }
  errorBox.classList.add("hidden");

  const summary = summarizeDiff(result.diff);
  summaryEl.textContent = `${pluralize(summary.additions, "addition")}, ${pluralize(summary.removals, "removal")}, ${summary.unchanged} unchanged`;

  outputEl.innerHTML = result.diff
    .map((entry) => {
      const { prefix, className } = LINE_STYLE[entry.type];
      return `<div class="whitespace-pre-wrap px-2 py-0.5 ${className}">${prefix} ${escapeHtml(entry.line)}</div>`;
    })
    .join("");
}

[inputA, inputB].forEach((el) => el.addEventListener("input", debounce(render, 150)));
render();
