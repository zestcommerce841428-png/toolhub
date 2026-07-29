import { SPEED_UNITS, convertSpeed, convertToAllUnits, formatSpeed } from "./logic.js";
import { bindCopyButton } from "/assets/js/core/clipboard.js";
import { showToast } from "/assets/js/core/toast.js";

const valueInput = document.getElementById("speed-value");
const fromSelect = document.getElementById("speed-from");
const toSelect = document.getElementById("speed-to");
const resultInput = document.getElementById("speed-result");
const allUnitsList = document.getElementById("speed-all-units");

function populateSelect(select, defaultUnitId) {
  select.innerHTML = SPEED_UNITS.map(
    (unit) => `<option value="${unit.id}" ${unit.id === defaultUnitId ? "selected" : ""}>${unit.label}</option>`
  ).join("");
}
populateSelect(fromSelect, "kph");
populateSelect(toSelect, "mph");

function render() {
  const value = Number(valueInput.value);
  const fromId = fromSelect.value;
  const toId = toSelect.value;

  if (!Number.isFinite(value)) {
    resultInput.value = "";
    allUnitsList.innerHTML = "";
    return;
  }

  resultInput.value = `${formatSpeed(convertSpeed(value, fromId, toId))} ${toId}`;

  allUnitsList.innerHTML = convertToAllUnits(value, fromId)
    .map(
      (entry) => `
      <div>
        <dt class="text-text-muted">${entry.label}</dt>
        <dd class="font-mono text-text">${formatSpeed(entry.value)}</dd>
      </div>`
    )
    .join("");
}

valueInput.addEventListener("input", render);
fromSelect.addEventListener("change", render);
toSelect.addEventListener("change", render);

document.getElementById("speed-swap").addEventListener("click", () => {
  const previousFrom = fromSelect.value;
  fromSelect.value = toSelect.value;
  toSelect.value = previousFrom;
  render();
});

bindCopyButton(document.getElementById("speed-copy"), () => resultInput.value, {
  onCopied: (success) => {
    if (!success) showToast("Couldn't copy — try selecting the result manually.", { variant: "danger" });
  },
});

render();
