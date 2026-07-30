import { removeDuplicateLines } from "./logic.js";
import { bindCopyButton } from "/assets/js/core/clipboard.js";
import { downloadText } from "/assets/js/core/download.js";
import { showToast } from "/assets/js/core/toast.js";
import { pluralize } from "/assets/js/core/utility.js";

const input = document.getElementById("dedupe-input");
const caseSensitiveCheckbox = document.getElementById("dedupe-case-sensitive");
const trimCheckbox = document.getElementById("dedupe-trim");
const keepLastCheckbox = document.getElementById("dedupe-keep-last");
const summaryEl = document.getElementById("dedupe-summary");
const output = document.getElementById("dedupe-output");

function render() {
  const { result, removedCount } = removeDuplicateLines(input.value, {
    caseSensitive: caseSensitiveCheckbox.checked,
    trimLines: trimCheckbox.checked,
    keepLast: keepLastCheckbox.checked,
  });
  output.value = result;
  summaryEl.textContent = input.value ? `Removed ${pluralize(removedCount, "duplicate line")}.` : "";
}

[input, caseSensitiveCheckbox, trimCheckbox, keepLastCheckbox].forEach((el) => el.addEventListener("input", render));

bindCopyButton(document.getElementById("dedupe-copy"), () => output.value, {
  onCopied: (success) => {
    if (!output.value) return;
    if (!success) showToast("Couldn't copy — try selecting the text manually.", { variant: "danger" });
  },
});

document.getElementById("dedupe-download").addEventListener("click", () => {
  if (!output.value) {
    showToast("Add some text first.", { variant: "info" });
    return;
  }
  downloadText("deduplicated.txt", output.value);
});

render();
