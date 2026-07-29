import { convertCsvToJson } from "./logic.js";
import { bindCopyButton } from "/assets/js/core/clipboard.js";
import { downloadText } from "/assets/js/core/download.js";
import { showToast } from "/assets/js/core/toast.js";

const input = document.getElementById("csv2json-input");
const headerCheckbox = document.getElementById("csv2json-header");
const delimiterSelect = document.getElementById("csv2json-delimiter");
const errorBox = document.getElementById("csv2json-error");
const output = document.getElementById("csv2json-output");

function resolveDelimiter() {
  return delimiterSelect.value === "tab" ? "\t" : delimiterSelect.value;
}

function render() {
  const result = convertCsvToJson(input.value, { hasHeader: headerCheckbox.checked, delimiter: resolveDelimiter() });
  if (!result.ok) {
    output.value = "";
    errorBox.textContent = input.value.trim() ? result.error : "";
    errorBox.classList.toggle("hidden", !input.value.trim());
    return;
  }
  errorBox.classList.add("hidden");
  output.value = result.json;
}

[input, headerCheckbox, delimiterSelect].forEach((el) => el.addEventListener("input", render));

bindCopyButton(document.getElementById("csv2json-copy"), () => output.value, {
  onCopied: (success) => {
    if (!output.value) return;
    if (!success) showToast("Couldn't copy — try selecting the text manually.", { variant: "danger" });
  },
});

document.getElementById("csv2json-download").addEventListener("click", () => {
  if (!output.value) {
    showToast("Paste some valid CSV first.", { variant: "info" });
    return;
  }
  downloadText("data.json", output.value, "application/json;charset=utf-8");
});

render();
