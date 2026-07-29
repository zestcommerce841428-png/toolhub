import { generatePassword, estimateEntropyBits, strengthLabel } from "./logic.js";
import { bindCopyButton } from "/assets/js/core/clipboard.js";
import { showToast } from "/assets/js/core/toast.js";

const output = document.getElementById("password-output");
const strengthBar = document.getElementById("password-strength-bar");
const strengthText = document.getElementById("password-strength");
const lengthInput = document.getElementById("password-length");
const lengthValue = document.getElementById("password-length-value");
const errorEl = document.getElementById("password-options-error");

const checkboxes = {
  useLowercase: document.getElementById("opt-lowercase"),
  useUppercase: document.getElementById("opt-uppercase"),
  useNumbers: document.getElementById("opt-numbers"),
  useSymbols: document.getElementById("opt-symbols"),
};
const excludeAmbiguous = document.getElementById("opt-exclude-ambiguous");

const STRENGTH_STYLES = {
  Weak: { width: "25%", barClass: "bg-danger" },
  Fair: { width: "50%", barClass: "bg-warning" },
  Strong: { width: "75%", barClass: "bg-info" },
  "Very strong": { width: "100%", barClass: "bg-success" },
};

function currentOptions() {
  return {
    length: Number(lengthInput.value),
    useLowercase: checkboxes.useLowercase.checked,
    useUppercase: checkboxes.useUppercase.checked,
    useNumbers: checkboxes.useNumbers.checked,
    useSymbols: checkboxes.useSymbols.checked,
    excludeAmbiguous: excludeAmbiguous.checked,
  };
}

function regenerate() {
  const result = generatePassword(currentOptions());

  if (!result.ok) {
    errorEl.textContent = result.error;
    errorEl.classList.remove("hidden");
    output.value = "";
    strengthText.textContent = "Strength: —";
    strengthBar.style.width = "0%";
    return;
  }

  errorEl.classList.add("hidden");
  output.value = result.password;

  const bits = estimateEntropyBits(result.password.length, result.poolSize);
  const label = strengthLabel(bits);
  const style = STRENGTH_STYLES[label];
  strengthBar.className = `h-full rounded-full transition-all duration-normal ${style.barClass}`;
  strengthBar.style.width = style.width;
  strengthText.textContent = `Strength: ${label} (~${bits} bits of entropy)`;
}

lengthInput.addEventListener("input", () => {
  lengthValue.textContent = lengthInput.value;
  regenerate();
});

Object.values(checkboxes).forEach((checkbox) => checkbox.addEventListener("change", regenerate));
excludeAmbiguous.addEventListener("change", regenerate);
document.getElementById("password-regenerate").addEventListener("click", regenerate);

bindCopyButton(document.getElementById("password-copy"), () => output.value, {
  onCopied: (success) => {
    if (!output.value) return;
    if (!success) showToast("Couldn't copy — try selecting the password manually.", { variant: "danger" });
  },
});

regenerate();
