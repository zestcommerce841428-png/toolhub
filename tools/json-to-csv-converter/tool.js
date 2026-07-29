import { convertJsonToCsv } from "./logic.js";
import { bindCopyButton } from "/assets/js/core/clipboard.js";
import { downloadText } from "/assets/js/core/download.js";
import { showToast } from "/assets/js/core/toast.js";

const input = document.getElementById("json2csv-input");
const delimiterSelect = document.getElementById("json2csv-delimiter");
const errorBox = document.getElementById("json2csv-error");
const output = document.getElementById("json2csv-output");

function resolveDelimiter() {
  return delimiterSelect.value === "tab" ? "\t" : delimiterSelect.value;
}

function render() {
  const result = convertJsonToCsv(input.value, { delimiter: resolveDelimiter() });
  if (!result.ok) {
    output.value = "";
    errorBox.textContent = input.value.trim() ? result.error : "";
    errorBox.classList.toggle("hidden", !input.value.trim());
    return;
  }
  errorBox.classList.add("hidden");
  output.value = result.csv;
}

[input, delimiterSelect].forEach((el) => el.addEventListener("input", render));

bindCopyButton(document.getElementById("json2csv-copy"), () => output.value, {
  onCopied: (success) => {
    if (!output.value) return;
    if (!success) showToast("Couldn't copy — try selecting the text manually.", { variant: "danger" });
  },
});

document.getElementById("json2csv-download").addEventListener("click", () => {
  if (!output.value) {
    showToast("Paste a valid JSON array of objects first.", { variant: "info" });
    return;
  }
  downloadText("data.csv", output.value, "text/csv;charset=utf-8");
});

render();
