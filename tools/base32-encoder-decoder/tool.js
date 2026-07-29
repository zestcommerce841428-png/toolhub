import { base32Encode, base32Decode } from "./logic.js";
import { initRadioGroup } from "/assets/js/core/radiogroup.js";
import { bindCopyButton } from "/assets/js/core/clipboard.js";
import { showToast } from "/assets/js/core/toast.js";

const group = document.getElementById("b32-mode-group");
const inputLabel = document.getElementById("b32-input-label");
const outputLabel = document.getElementById("b32-output-label");
const input = document.getElementById("b32-input");
const output = document.getElementById("b32-output");
const errorBox = document.getElementById("b32-error");

let mode = "encode";
initRadioGroup(group, (radio) => {
  mode = radio.dataset.mode;
  inputLabel.textContent = mode === "encode" ? "Text" : "Base32";
  outputLabel.textContent = mode === "encode" ? "Base32" : "Text";
  render();
});

function render() {
  errorBox.classList.add("hidden");
  if (mode === "encode") {
    output.value = base32Encode(input.value);
  } else {
    const result = base32Decode(input.value);
    if (result.ok) {
      output.value = result.text;
    } else {
      output.value = "";
      if (input.value.trim()) {
        errorBox.textContent = result.error;
        errorBox.classList.remove("hidden");
      }
    }
  }
}

input.addEventListener("input", render);

document.getElementById("b32-swap").addEventListener("click", () => {
  const swappedInput = output.value;
  const nextRadio = group.querySelector(`[data-mode="${mode === "encode" ? "decode" : "encode"}"]`);
  nextRadio.click(); // updates `mode`, labels, and calls render() via initRadioGroup's onSelect
  input.value = swappedInput;
  render();
});

bindCopyButton(document.getElementById("b32-copy"), () => output.value, {
  onCopied: (success) => {
    if (!output.value) return;
    if (!success) showToast("Couldn't copy — try selecting the text manually.", { variant: "danger" });
  },
});

render();
