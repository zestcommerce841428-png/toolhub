import { WEIGHT_UNITS, convertWeight, convertToAllUnits, formatWeight } from "./logic.js";
import { bindCopyButton } from "/assets/js/core/clipboard.js";
import { showToast } from "/assets/js/core/toast.js";

const valueInput = document.getElementById("weight-value");
const fromSelect = document.getElementById("weight-from");
const toSelect = document.getElementById("weight-to");
const resultInput = document.getElementById("weight-result");
const allUnitsList = document.getElementById("weight-all-units");

function populateSelect(select, defaultUnitId) {
  select.innerHTML = WEIGHT_UNITS.map(
    (unit) => `<option value="${unit.id}" ${unit.id === defaultUnitId ? "selected" : ""}>${unit.label}</option>`
  ).join("");
}
populateSelect(fromSelect, "kg");
populateSelect(toSelect, "lb");

function render() {
  const value = Number(valueInput.value);
  const fromId = fromSelect.value;
  const toId = toSelect.value;

  if (!Number.isFinite(value)) {
    resultInput.value = "";
    allUnitsList.innerHTML = "";
    return;
  }

  resultInput.value = `${formatWeight(convertWeight(value, fromId, toId))} ${toId}`;

  allUnitsList.innerHTML = convertToAllUnits(value, fromId)
    .map(
      (entry) => `
      <div>
        <dt class="text-text-muted">${entry.label}</dt>
        <dd class="font-mono text-text">${formatWeight(entry.value)}</dd>
      </div>`
    )
    .join("");
}

valueInput.addEventListener("input", render);
fromSelect.addEventListener("change", render);
toSelect.addEventListener("change", render);

document.getElementById("weight-swap").addEventListener("click", () => {
  const previousFrom = fromSelect.value;
  fromSelect.value = toSelect.value;
  toSelect.value = previousFrom;
  render();
});

bindCopyButton(document.getElementById("weight-copy"), () => resultInput.value, {
  onCopied: (success) => {
    if (!success) showToast("Couldn't copy — try selecting the result manually.", { variant: "danger" });
  },
});

render();
