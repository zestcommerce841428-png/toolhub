import { resolveUpcADigits, buildUpcAModules, renderBarcodeSvg } from "./logic.js";
import { downloadText } from "/assets/js/core/download.js";
import { showToast } from "/assets/js/core/toast.js";

const input = document.getElementById("upca-input");
const errorBox = document.getElementById("upca-error");
const barcodeBox = document.getElementById("upca-barcode");

let currentSvg = "";

function render() {
  const outcome = resolveUpcADigits(input.value);
  if (!outcome.ok) {
    errorBox.textContent = input.value.trim() ? outcome.error : "";
    errorBox.classList.remove("hidden");
    barcodeBox.innerHTML = "";
    currentSvg = "";
    return;
  }
  errorBox.classList.add("hidden");
  const modules = buildUpcAModules(outcome.digits);
  currentSvg = renderBarcodeSvg(modules, outcome.digits);
  barcodeBox.innerHTML = currentSvg;
}

input.addEventListener("input", render);

document.getElementById("upca-download").addEventListener("click", () => {
  if (!currentSvg) {
    showToast("Enter a valid 11 or 12-digit code first.", { variant: "info" });
    return;
  }
  downloadText("barcode.svg", currentSvg, "image/svg+xml;charset=utf-8");
});

render();
