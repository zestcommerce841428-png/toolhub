import { generateSku } from "./logic.js";
import { bindCopyButton } from "/assets/js/core/clipboard.js";
import { showToast } from "/assets/js/core/toast.js";

const categoryInput = document.getElementById("sku-category");
const productInput = document.getElementById("sku-product");
const variantInput = document.getElementById("sku-variant");
const separatorSelect = document.getElementById("sku-separator");
const suffixLengthInput = document.getElementById("sku-suffix-length");
const output = document.getElementById("sku-output");
const errorEl = document.getElementById("sku-error");

function render() {
  const result = generateSku({
    categoryCode: categoryInput.value,
    productName: productInput.value,
    variant: variantInput.value,
    separator: separatorSelect.value,
    suffixLength: Number(suffixLengthInput.value) || 0,
  });

  if (!result.ok) {
    errorEl.textContent = result.error;
    errorEl.classList.remove("hidden");
    output.textContent = "—";
    return;
  }

  errorEl.classList.add("hidden");
  output.textContent = result.sku;
}

[categoryInput, productInput, variantInput, separatorSelect, suffixLengthInput].forEach((el) =>
  el.addEventListener("input", render)
);
document.getElementById("sku-regenerate").addEventListener("click", render);

bindCopyButton(document.getElementById("sku-copy"), () => (output.textContent === "—" ? "" : output.textContent), {
  onCopied: (success) => {
    if (output.textContent === "—") return;
    if (!success) showToast("Couldn't copy — try selecting the text manually.", { variant: "danger" });
  },
});

render();
