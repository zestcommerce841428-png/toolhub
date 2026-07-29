import { VOLUME_UNITS, convertVolume, convertToAllUnits, formatVolume } from "./logic.js";
import { bindCopyButton } from "/assets/js/core/clipboard.js";
import { showToast } from "/assets/js/core/toast.js";

const valueInput = document.getElementById("volume-value");
const fromSelect = document.getElementById("volume-from");
const toSelect = document.getElementById("volume-to");
const resultInput = document.getElementById("volume-result");
const allUnitsList = document.getElementById("volume-all-units");

function populateSelect(select, defaultUnitId) {
  select.innerHTML = VOLUME_UNITS.map(
    (unit) => `<option value="${unit.id}" ${unit.id === defaultUnitId ? "selected" : ""}>${unit.label}</option>`
  ).join("");
}
populateSelect(fromSelect, "l");
populateSelect(toSelect, "galUs");

function render() {
  const value = Number(valueInput.value);
  const fromId = fromSelect.value;
  const toId = toSelect.value;

  if (!Number.isFinite(value)) {
    resultInput.value = "";
    allUnitsList.innerHTML = "";
    return;
  }

  resultInput.value = `${formatVolume(convertVolume(value, fromId, toId))} ${toId}`;

  allUnitsList.innerHTML = convertToAllUnits(value, fromId)
    .map(
      (entry) => `
      <div>
        <dt class="text-text-muted">${entry.label}</dt>
        <dd class="font-mono text-text">${formatVolume(entry.value)}</dd>
      </div>`
    )
    .join("");
}

valueInput.addEventListener("input", render);
fromSelect.addEventListener("change", render);
toSelect.addEventListener("change", render);

document.getElementById("volume-swap").addEventListener("click", () => {
  const previousFrom = fromSelect.value;
  fromSelect.value = toSelect.value;
  toSelect.value = previousFrom;
  render();
});

bindCopyButton(document.getElementById("volume-copy"), () => resultInput.value, {
  onCopied: (success) => {
    if (!success) showToast("Couldn't copy — try selecting the result manually.", { variant: "danger" });
  },
});

render();
