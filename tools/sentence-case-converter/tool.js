// Thin single-purpose wrapper around case-converter's logic — see
// docs/CONTRIBUTING.md, "Sharing logic.js across a tool family."
import { toSentenceCase } from "../case-converter/logic.js";
import { bindCopyButton } from "/assets/js/core/clipboard.js";
import { downloadText } from "/assets/js/core/download.js";
import { showToast } from "/assets/js/core/toast.js";

const input = document.getElementById("sentence-case-converter-input");
const output = document.getElementById("sentence-case-converter-output");

function render() {
  output.value = toSentenceCase(input.value);
}

input.addEventListener("input", render);

document.getElementById("sentence-case-converter-clear").addEventListener("click", () => {
  input.value = "";
  render();
  input.focus();
});

document.getElementById("sentence-case-converter-download").addEventListener("click", () => {
  if (!output.value) {
    showToast("Nothing to download yet.", { variant: "info" });
    return;
  }
  downloadText("sentence-case-text.txt", output.value);
});

bindCopyButton(document.getElementById("sentence-case-converter-copy"), () => output.value, {
  onCopied: (success) => {
    if (!success) showToast("Couldn't copy — try selecting the result manually.", { variant: "danger" });
  },
});

render();
