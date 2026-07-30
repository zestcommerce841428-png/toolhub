import { findAndReplace } from "./logic.js";
import { bindCopyButton } from "/assets/js/core/clipboard.js";
import { downloadText } from "/assets/js/core/download.js";
import { showToast } from "/assets/js/core/toast.js";
import { pluralize } from "/assets/js/core/utility.js";

const input = document.getElementById("findreplace-input");
const findInput = document.getElementById("findreplace-find");
const replaceInput = document.getElementById("findreplace-replace");
const regexCheckbox = document.getElementById("findreplace-regex");
const caseCheckbox = document.getElementById("findreplace-case");
const wholeWordCheckbox = document.getElementById("findreplace-whole-word");
const allCheckbox = document.getElementById("findreplace-all");
const errorBox = document.getElementById("findreplace-error");
const summaryEl = document.getElementById("findreplace-summary");
const output = document.getElementById("findreplace-output");

function render() {
  if (!findInput.value) {
    errorBox.classList.add("hidden");
    summaryEl.textContent = "";
    output.value = input.value;
    return;
  }

  const result = findAndReplace(input.value, findInput.value, replaceInput.value, {
    useRegex: regexCheckbox.checked,
    caseSensitive: caseCheckbox.checked,
    wholeWord: wholeWordCheckbox.checked,
    replaceAll: allCheckbox.checked,
  });

  if (!result.ok) {
    errorBox.textContent = result.error;
    errorBox.classList.remove("hidden");
    summaryEl.textContent = "";
    return;
  }
  errorBox.classList.add("hidden");
  summaryEl.textContent = `${pluralize(result.matchCount, "match", "matches")} found.`;
  output.value = result.result;
}

[input, findInput, replaceInput, regexCheckbox, caseCheckbox, wholeWordCheckbox, allCheckbox].forEach((el) =>
  el.addEventListener("input", render)
);

bindCopyButton(document.getElementById("findreplace-copy"), () => output.value, {
  onCopied: (success) => {
    if (!output.value) return;
    if (!success) showToast("Couldn't copy — try selecting the text manually.", { variant: "danger" });
  },
});

document.getElementById("findreplace-download").addEventListener("click", () => {
  if (!output.value) {
    showToast("Add some text first.", { variant: "info" });
    return;
  }
  downloadText("replaced.txt", output.value);
});

render();
