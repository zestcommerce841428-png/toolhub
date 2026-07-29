import { AREA_UNITS, convertArea, convertToAllUnits, formatArea } from "./logic.js";
import { bindCopyButton } from "/assets/js/core/clipboard.js";
import { showToast } from "/assets/js/core/toast.js";

const valueInput = document.getElementById("area-value");
const fromSelect = document.getElementById("area-from");
const toSelect = document.getElementById("area-to");
const resultInput = document.getElementById("area-result");
const allUnitsList = document.getElementById("area-all-units");

function populateSelect(select, defaultUnitId) {
  select.innerHTML = AREA_UNITS.map(
    (unit) => `<option value="${unit.id}" ${unit.id === defaultUnitId ? "selected" : ""}>${unit.label}</option>`
  ).join("");
}
populateSelect(fromSelect, "m2");
populateSelect(toSelect, "ft2");

function render() {
  const value = Number(valueInput.value);
  const fromId = fromSelect.value;
  const toId = toSelect.value;

  if (!Number.isFinite(value)) {
    resultInput.value = "";
    allUnitsList.innerHTML = "";
    return;
  }

  resultInput.value = `${formatArea(convertArea(value, fromId, toId))} ${toId}`;

  allUnitsList.innerHTML = convertToAllUnits(value, fromId)
    .map(
      (entry) => `
      <div>
        <dt class="text-text-muted">${entry.label}</dt>
        <dd class="font-mono text-text">${formatArea(entry.value)}</dd>
      </div>`
    )
    .join("");
}

valueInput.addEventListener("input", render);
fromSelect.addEventListener("change", render);
toSelect.addEventListener("change", render);

document.getElementById("area-swap").addEventListener("click", () => {
  const previousFrom = fromSelect.value;
  fromSelect.value = toSelect.value;
  toSelect.value = previousFrom;
  render();
});

bindCopyButton(document.getElementById("area-copy"), () => resultInput.value, {
  onCopied: (success) => {
    if (!success) showToast("Couldn't copy — try selecting the result manually.", { variant: "danger" });
  },
});

render();
