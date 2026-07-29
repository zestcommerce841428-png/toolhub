import { LENGTH_UNITS, convertLength, convertToAllUnits, formatLength } from "./logic.js";
import { bindCopyButton } from "/assets/js/core/clipboard.js";
import { showToast } from "/assets/js/core/toast.js";

const valueInput = document.getElementById("length-value");
const fromSelect = document.getElementById("length-from");
const toSelect = document.getElementById("length-to");
const resultInput = document.getElementById("length-result");
const allUnitsList = document.getElementById("length-all-units");

function populateSelect(select, defaultUnitId) {
  select.innerHTML = LENGTH_UNITS.map(
    (unit) => `<option value="${unit.id}" ${unit.id === defaultUnitId ? "selected" : ""}>${unit.label}</option>`
  ).join("");
}
populateSelect(fromSelect, "m");
populateSelect(toSelect, "ft");

function render() {
  const value = Number(valueInput.value);
  const fromId = fromSelect.value;
  const toId = toSelect.value;

  if (!Number.isFinite(value)) {
    resultInput.value = "";
    allUnitsList.innerHTML = "";
    return;
  }

  resultInput.value = `${formatLength(convertLength(value, fromId, toId))} ${toId}`;

  allUnitsList.innerHTML = convertToAllUnits(value, fromId)
    .map(
      (entry) => `
      <div>
        <dt class="text-text-muted">${entry.label}</dt>
        <dd class="font-mono text-text">${formatLength(entry.value)}</dd>
      </div>`
    )
    .join("");
}

valueInput.addEventListener("input", render);
fromSelect.addEventListener("change", render);
toSelect.addEventListener("change", render);

document.getElementById("length-swap").addEventListener("click", () => {
  const previousFrom = fromSelect.value;
  fromSelect.value = toSelect.value;
  toSelect.value = previousFrom;
  render();
});

bindCopyButton(document.getElementById("length-copy"), () => resultInput.value, {
  onCopied: (success) => {
    if (!success) showToast("Couldn't copy — try selecting the result manually.", { variant: "danger" });
  },
});

render();
