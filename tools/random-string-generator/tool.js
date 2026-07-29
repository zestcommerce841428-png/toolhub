import { generateRandomStrings } from "./logic.js";
import { bindCopyButton } from "/assets/js/core/clipboard.js";
import { downloadText } from "/assets/js/core/download.js";
import { showToast } from "/assets/js/core/toast.js";

const lengthInput = document.getElementById("rs-length");
const countInput = document.getElementById("rs-count");
const lowercaseCheckbox = document.getElementById("rs-lowercase");
const uppercaseCheckbox = document.getElementById("rs-uppercase");
const digitsCheckbox = document.getElementById("rs-digits");
const symbolsCheckbox = document.getElementById("rs-symbols");
const customInput = document.getElementById("rs-custom");
const errorBox = document.getElementById("rs-error");
const output = document.getElementById("rs-output");

function generate() {
  const length = Math.max(1, Math.round(Number(lengthInput.value)) || 1);
  const count = Math.max(1, Math.round(Number(countInput.value)) || 1);
  const result = generateRandomStrings(length, count, {
    lowercase: lowercaseCheckbox.checked,
    uppercase: uppercaseCheckbox.checked,
    digits: digitsCheckbox.checked,
    symbols: symbolsCheckbox.checked,
    customChars: customInput.value,
  });

  if (!result.ok) {
    errorBox.textContent = result.error;
    errorBox.classList.remove("hidden");
    output.value = "";
    return;
  }
  errorBox.classList.add("hidden");
  output.value = result.strings.join("\n");
}

document.getElementById("rs-generate").addEventListener("click", generate);
[lowercaseCheckbox, uppercaseCheckbox, digitsCheckbox, symbolsCheckbox, customInput].forEach((el) =>
  el.addEventListener("input", generate)
);

document.getElementById("rs-download").addEventListener("click", () => {
  if (!output.value) {
    showToast("Generate some strings first.", { variant: "info" });
    return;
  }
  downloadText("random-strings.txt", output.value);
});

bindCopyButton(document.getElementById("rs-copy"), () => output.value, {
  onCopied: (success) => {
    if (!output.value) return;
    if (!success) showToast("Couldn't copy — try selecting the text manually.", { variant: "danger" });
  },
});

generate();
