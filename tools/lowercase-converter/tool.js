// Thin single-purpose wrapper around case-converter's logic — see
// docs/CONTRIBUTING.md, "Sharing logic.js across a tool family."
import { toLowerCase } from "../case-converter/logic.js";
import { bindCopyButton } from "/assets/js/core/clipboard.js";
import { downloadText } from "/assets/js/core/download.js";
import { showToast } from "/assets/js/core/toast.js";

const input = document.getElementById("lowercase-converter-input");
const output = document.getElementById("lowercase-converter-output");

function render() {
  output.value = toLowerCase(input.value);
}

input.addEventListener("input", render);

document.getElementById("lowercase-converter-clear").addEventListener("click", () => {
  input.value = "";
  render();
  input.focus();
});

document.getElementById("lowercase-converter-download").addEventListener("click", () => {
  if (!output.value) {
    showToast("Nothing to download yet.", { variant: "info" });
    return;
  }
  downloadText("lowercase-text.txt", output.value);
});

bindCopyButton(document.getElementById("lowercase-converter-copy"), () => output.value, {
  onCopied: (success) => {
    if (!success) showToast("Couldn't copy — try selecting the result manually.", { variant: "danger" });
  },
});

render();
