// Thin single-purpose wrapper around case-converter's logic — see
// docs/CONTRIBUTING.md, "Sharing logic.js across a tool family."
import { toCapitalizedWords } from "../case-converter/logic.js";
import { bindCopyButton } from "/assets/js/core/clipboard.js";
import { downloadText } from "/assets/js/core/download.js";
import { showToast } from "/assets/js/core/toast.js";

const input = document.getElementById("capitalize-words-input");
const output = document.getElementById("capitalize-words-output");

function render() {
  output.value = toCapitalizedWords(input.value);
}

input.addEventListener("input", render);

document.getElementById("capitalize-words-clear").addEventListener("click", () => {
  input.value = "";
  render();
  input.focus();
});

document.getElementById("capitalize-words-download").addEventListener("click", () => {
  if (!output.value) {
    showToast("Nothing to download yet.", { variant: "info" });
    return;
  }
  downloadText("capitalized-text.txt", output.value);
});

bindCopyButton(document.getElementById("capitalize-words-copy"), () => output.value, {
  onCopied: (success) => {
    if (!success) showToast("Couldn't copy — try selecting the result manually.", { variant: "danger" });
  },
});

render();
