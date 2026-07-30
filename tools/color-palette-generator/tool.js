import { generatePalette } from "./logic.js";
import { initRadioGroup } from "/assets/js/core/radiogroup.js";
import { copyToClipboard } from "/assets/js/core/clipboard.js";
import { showToast } from "/assets/js/core/toast.js";

const baseText = document.getElementById("palette-base");
const basePicker = document.getElementById("palette-base-picker");
const errorBox = document.getElementById("palette-error");
const swatchesEl = document.getElementById("palette-swatches");
const schemeGroup = document.getElementById("palette-scheme-group");

let scheme = "complementary";
initRadioGroup(schemeGroup, (radio) => {
  scheme = radio.dataset.scheme;
  render();
});

function render() {
  const result = generatePalette(baseText.value, scheme);
  if (!result.ok) {
    errorBox.textContent = result.error;
    errorBox.classList.remove("hidden");
    swatchesEl.innerHTML = "";
    return;
  }
  errorBox.classList.add("hidden");
  if (/^#[0-9a-f]{6}$/i.test(baseText.value)) basePicker.value = baseText.value;

  swatchesEl.innerHTML = result.colors
    .map(
      (hex) => `
      <button type="button" class="palette-swatch card p-0 overflow-hidden text-left" data-hex="${hex}">
        <span class="block h-20 w-full" style="background-color: ${hex}"></span>
        <span class="block px-3 py-2 font-mono text-sm text-text">${hex}</span>
      </button>`
    )
    .join("");
}

baseText.addEventListener("input", render);
basePicker.addEventListener("input", () => {
  baseText.value = basePicker.value;
  render();
});

swatchesEl.addEventListener("click", async (event) => {
  const swatch = event.target.closest(".palette-swatch");
  if (!swatch) return;
  const success = await copyToClipboard(swatch.dataset.hex);
  showToast(
    success ? `Copied ${swatch.dataset.hex}` : "Couldn't copy — try selecting the text manually.",
    { variant: success ? "success" : "danger" }
  );
});

render();
