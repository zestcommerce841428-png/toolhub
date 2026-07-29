import { parseHex, rgbToHex, formatRgbString, clampByte } from "./logic.js";
import { bindCopyButton } from "/assets/js/core/clipboard.js";
import { showToast } from "/assets/js/core/toast.js";

const swatch = document.getElementById("color-swatch");
const colorPicker = document.getElementById("color-picker");
const hexInput = document.getElementById("hex-input");
const hexError = document.getElementById("hex-error");
const rInput = document.getElementById("rgb-r");
const gInput = document.getElementById("rgb-g");
const bInput = document.getElementById("rgb-b");
const rgbOutput = document.getElementById("rgb-output");
const rgbError = document.getElementById("rgb-error");

/**
 * Applies a resolved color everywhere except the field that triggered the
 * change (so we never fight the user's cursor position while they type).
 */
function applyColor(source, rgba) {
  const hex = rgbToHex(rgba);
  swatch.style.backgroundColor = hex;
  rgbOutput.value = formatRgbString(rgba);

  if (source !== hexInput) hexInput.value = hex;
  if (source !== rInput) rInput.value = String(rgba.r);
  if (source !== gInput) gInput.value = String(rgba.g);
  if (source !== bInput) bInput.value = String(rgba.b);
  if (source !== colorPicker) colorPicker.value = hex.slice(0, 7);
}

function showError(el, message) {
  el.textContent = message;
  el.classList.toggle("hidden", !message);
}

hexInput.addEventListener("input", () => {
  const parsed = parseHex(hexInput.value);
  if (!parsed) {
    showError(hexError, hexInput.value.trim() === "" ? "" : "Enter a valid HEX color, e.g. #2563eb.");
    return;
  }
  showError(hexError, "");
  applyColor(hexInput, parsed);
});

function handleRgbInput() {
  const raw = { r: rInput.value, g: gInput.value, b: bInput.value };
  const allFilled = raw.r !== "" && raw.g !== "" && raw.b !== "";
  if (!allFilled) {
    showError(rgbError, "");
    return;
  }
  const r = Number(raw.r);
  const g = Number(raw.g);
  const b = Number(raw.b);
  const valid = [r, g, b].every((value) => Number.isInteger(value) && value >= 0 && value <= 255);
  if (!valid) {
    showError(rgbError, "Each value must be a whole number from 0 to 255.");
    return;
  }
  showError(rgbError, "");
  applyColor(this, { r: clampByte(r), g: clampByte(g), b: clampByte(b), a: 1 });
}

[rInput, gInput, bInput].forEach((el) => el.addEventListener("input", handleRgbInput));

colorPicker.addEventListener("input", () => {
  const parsed = parseHex(colorPicker.value);
  if (parsed) {
    showError(hexError, "");
    applyColor(colorPicker, parsed);
  }
});

bindCopyButton(document.getElementById("hex-copy"), () => hexInput.value, {
  onCopied: (success) => {
    if (!success) showToast("Couldn't copy — try selecting the value manually.", { variant: "danger" });
  },
});
bindCopyButton(document.getElementById("rgb-copy"), () => rgbOutput.value, {
  onCopied: (success) => {
    if (!success) showToast("Couldn't copy — try selecting the value manually.", { variant: "danger" });
  },
});

// Initialize the swatch/picker from the pre-filled markup values.
applyColor(null, { r: 37, g: 99, b: 235, a: 1 });
