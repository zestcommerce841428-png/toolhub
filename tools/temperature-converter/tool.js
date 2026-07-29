import { TEMPERATURE_UNITS, convertTemperature, convertToAllUnits, formatTemperature } from "./logic.js";
import { bindCopyButton } from "/assets/js/core/clipboard.js";
import { showToast } from "/assets/js/core/toast.js";

const valueInput = document.getElementById("temp-value");
const fromSelect = document.getElementById("temp-from");
const toSelect = document.getElementById("temp-to");
const resultInput = document.getElementById("temp-result");
const errorBox = document.getElementById("temp-error");
const allUnitsList = document.getElementById("temp-all-units");

function populateSelect(select, defaultUnitId) {
  select.innerHTML = TEMPERATURE_UNITS.map(
    (unit) => `<option value="${unit.id}" ${unit.id === defaultUnitId ? "selected" : ""}>${unit.label} (${unit.symbol})</option>`
  ).join("");
}
populateSelect(fromSelect, "c");
populateSelect(toSelect, "f");

function render() {
  const value = Number(valueInput.value);
  const fromId = fromSelect.value;
  const toId = toSelect.value;
  const toUnit = TEMPERATURE_UNITS.find((unit) => unit.id === toId);

  const result = convertTemperature(value, fromId, toId);
  if (!result.ok) {
    resultInput.value = "";
    errorBox.textContent = result.error;
    errorBox.classList.remove("hidden");
    allUnitsList.innerHTML = "";
    return;
  }
  errorBox.classList.add("hidden");
  resultInput.value = `${formatTemperature(result.value)} ${toUnit.symbol}`;

  allUnitsList.innerHTML = convertToAllUnits(value, fromId)
    .map(
      (entry) => `
      <div>
        <dt class="text-text-muted">${entry.label}</dt>
        <dd class="font-mono text-text">${formatTemperature(entry.value)} ${entry.symbol}</dd>
      </div>`
    )
    .join("");
}

valueInput.addEventListener("input", render);
fromSelect.addEventListener("change", render);
toSelect.addEventListener("change", render);

document.getElementById("temp-swap").addEventListener("click", () => {
  const previousFrom = fromSelect.value;
  fromSelect.value = toSelect.value;
  toSelect.value = previousFrom;
  render();
});

bindCopyButton(document.getElementById("temp-copy"), () => resultInput.value, {
  onCopied: (success) => {
    if (!success) showToast("Couldn't copy — try selecting the result manually.", { variant: "danger" });
  },
});

render();
