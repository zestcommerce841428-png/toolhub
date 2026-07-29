import { generateRandomInts } from "./logic.js";
import { bindCopyButton } from "/assets/js/core/clipboard.js";
import { showToast } from "/assets/js/core/toast.js";

const minInput = document.getElementById("rng-min");
const maxInput = document.getElementById("rng-max");
const countInput = document.getElementById("rng-count");
const uniqueCheckbox = document.getElementById("rng-unique");
const errorEl = document.getElementById("rng-error");
const outputEl = document.getElementById("rng-output");

let lastValues = [];

function generate() {
  const result = generateRandomInts({
    min: Number(minInput.value),
    max: Number(maxInput.value),
    count: Number(countInput.value),
    allowDuplicates: !uniqueCheckbox.checked,
  });

  if (!result.ok) {
    errorEl.textContent = result.error;
    errorEl.classList.remove("hidden");
    return;
  }

  errorEl.classList.add("hidden");
  lastValues = result.values;
  outputEl.innerHTML = lastValues
    .map((value) => `<span class="badge px-3 py-1.5 text-base font-semibold text-text">${value}</span>`)
    .join("");
}

document.getElementById("rng-generate").addEventListener("click", generate);

bindCopyButton(document.getElementById("rng-copy"), () => lastValues.join(", "), {
  onCopied: (success) => {
    if (lastValues.length === 0) return;
    if (!success) showToast("Couldn't copy — try selecting the numbers manually.", { variant: "danger" });
  },
});

generate();
