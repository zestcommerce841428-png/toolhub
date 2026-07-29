import { generateSlug } from "./logic.js";
import { initRadioGroup } from "/assets/js/core/radiogroup.js";
import { bindCopyButton } from "/assets/js/core/clipboard.js";
import { showToast } from "/assets/js/core/toast.js";

const input = document.getElementById("slug-input");
const lowercaseCheckbox = document.getElementById("slug-lowercase");
const maxLengthInput = document.getElementById("slug-max-length");
const output = document.getElementById("slug-output");
const separatorGroup = document.getElementById("slug-separator-group");

let separator = "-";
initRadioGroup(separatorGroup, (radio) => {
  separator = radio.dataset.separator;
  render();
});

function render() {
  output.value = generateSlug(input.value, {
    separator,
    lowercase: lowercaseCheckbox.checked,
    maxLength: Number(maxLengthInput.value) || 0,
  });
}

[input, lowercaseCheckbox, maxLengthInput].forEach((el) => el.addEventListener("input", render));

bindCopyButton(document.getElementById("slug-copy"), () => output.value, {
  onCopied: (success) => {
    if (!output.value) return;
    if (!success) showToast("Couldn't copy — try selecting the slug manually.", { variant: "danger" });
  },
});

render();
