// Thin single-purpose wrapper around case-converter's logic — see
// docs/CONTRIBUTING.md, "Sharing logic.js across a tool family."
import { toUpperCase } from "../case-converter/logic.js";
import { bindCopyButton } from "/assets/js/core/clipboard.js";
import { downloadText } from "/assets/js/core/download.js";
import { showToast } from "/assets/js/core/toast.js";

const input = document.getElementById("uppercase-converter-input");
const output = document.getElementById("uppercase-converter-output");

function render() {
  output.value = toUpperCase(input.value);
}

input.addEventListener("input", render);

document.getElementById("uppercase-converter-clear").addEventListener("click", () => {
  input.value = "";
  render();
  input.focus();
});

document.getElementById("uppercase-converter-download").addEventListener("click", () => {
  if (!output.value) {
    showToast("Nothing to download yet.", { variant: "info" });
    return;
  }
  downloadText("uppercase-text.txt", output.value);
});

bindCopyButton(document.getElementById("uppercase-converter-copy"), () => output.value, {
  onCopied: (success) => {
    if (!success) showToast("Couldn't copy — try selecting the result manually.", { variant: "danger" });
  },
});

render();
