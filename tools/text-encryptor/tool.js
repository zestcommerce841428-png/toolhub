import { encryptText, decryptText } from "./logic.js";
import { initRadioGroup } from "/assets/js/core/radiogroup.js";
import { bindCopyButton } from "/assets/js/core/clipboard.js";
import { showToast } from "/assets/js/core/toast.js";

const group = document.getElementById("enc-mode-group");
const inputLabel = document.getElementById("enc-input-label");
const outputLabel = document.getElementById("enc-output-label");
const input = document.getElementById("enc-input");
const passphraseInput = document.getElementById("enc-passphrase");
const runButton = document.getElementById("enc-run");
const errorBox = document.getElementById("enc-error");
const output = document.getElementById("enc-output");

let mode = "encrypt";
initRadioGroup(group, (radio) => {
  mode = radio.dataset.mode;
  inputLabel.textContent = mode === "encrypt" ? "Text to encrypt" : "Encrypted text to decrypt";
  outputLabel.textContent = "Result";
  runButton.textContent = mode === "encrypt" ? "Encrypt" : "Decrypt";
  output.value = "";
  errorBox.classList.add("hidden");
});

async function run() {
  errorBox.classList.add("hidden");
  runButton.disabled = true;
  const previousLabel = runButton.textContent;
  runButton.textContent = "Working…";

  try {
    if (mode === "encrypt") {
      output.value = await encryptText(input.value, passphraseInput.value);
    } else {
      const result = await decryptText(input.value, passphraseInput.value);
      if (result.ok) {
        output.value = result.plaintext;
      } else {
        output.value = "";
        errorBox.textContent = result.error;
        errorBox.classList.remove("hidden");
      }
    }
  } finally {
    runButton.disabled = false;
    runButton.textContent = previousLabel;
  }
}

runButton.addEventListener("click", () => {
  if (!passphraseInput.value) {
    showToast("Enter a passphrase first.", { variant: "info" });
    return;
  }
  run();
});

bindCopyButton(document.getElementById("enc-copy"), () => output.value, {
  onCopied: (success) => {
    if (!output.value) return;
    if (!success) showToast("Couldn't copy — try selecting the text manually.", { variant: "danger" });
  },
});
