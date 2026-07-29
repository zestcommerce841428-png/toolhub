import { encodeUriComponentSafe, decodeUriComponentSafe, encodeFormUrl, decodeFormUrl } from "./logic.js";
import { initRadioGroup } from "/assets/js/core/radiogroup.js";
import { bindCopyButton } from "/assets/js/core/clipboard.js";
import { showToast } from "/assets/js/core/toast.js";

const input = document.getElementById("url-input");
const output = document.getElementById("url-output");
const status = document.getElementById("url-status");
const group = document.getElementById("url-mode-group");

let mode = "component";
initRadioGroup(group, (radio) => {
  mode = radio.dataset.mode;
});

function showResult(outcome) {
  if (outcome.ok) {
    output.value = outcome.result;
    status.textContent = "";
  } else {
    status.textContent = outcome.error;
  }
}

document.getElementById("url-encode").addEventListener("click", () => {
  showResult(mode === "component" ? encodeUriComponentSafe(input.value) : encodeFormUrl(input.value));
});

document.getElementById("url-decode").addEventListener("click", () => {
  showResult(mode === "component" ? decodeUriComponentSafe(input.value) : decodeFormUrl(input.value));
});

document.getElementById("url-swap").addEventListener("click", () => {
  const previous = input.value;
  input.value = output.value;
  output.value = previous;
  status.textContent = "";
});

document.getElementById("url-clear").addEventListener("click", () => {
  input.value = "";
  output.value = "";
  status.textContent = "";
  input.focus();
});

bindCopyButton(document.getElementById("url-copy"), () => output.value, {
  onCopied: (success) => {
    if (!output.value) return;
    if (!success) showToast("Couldn't copy — try selecting the output manually.", { variant: "danger" });
  },
});
