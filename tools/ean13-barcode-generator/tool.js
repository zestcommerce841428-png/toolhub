import { resolveEan13Digits, buildEan13Modules, renderBarcodeSvg } from "./logic.js";
import { downloadText } from "/assets/js/core/download.js";
import { showToast } from "/assets/js/core/toast.js";

const input = document.getElementById("ean13-input");
const errorBox = document.getElementById("ean13-error");
const barcodeBox = document.getElementById("ean13-barcode");

let currentSvg = "";

function render() {
  const outcome = resolveEan13Digits(input.value);
  if (!outcome.ok) {
    errorBox.textContent = input.value.trim() ? outcome.error : "";
    errorBox.classList.remove("hidden");
    barcodeBox.innerHTML = "";
    currentSvg = "";
    return;
  }
  errorBox.classList.add("hidden");
  const modules = buildEan13Modules(outcome.digits);
  currentSvg = renderBarcodeSvg(modules, outcome.digits);
  barcodeBox.innerHTML = currentSvg;
}

input.addEventListener("input", render);

document.getElementById("ean13-download").addEventListener("click", () => {
  if (!currentSvg) {
    showToast("Enter a valid 12 or 13-digit code first.", { variant: "info" });
    return;
  }
  downloadText("barcode.svg", currentSvg, "image/svg+xml;charset=utf-8");
});

render();
