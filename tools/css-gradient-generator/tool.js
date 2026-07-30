import { buildLinearGradient, buildRadialGradient, evenlyDistributedPositions } from "./logic.js";
import { initRadioGroup } from "/assets/js/core/radiogroup.js";
import { bindCopyButton } from "/assets/js/core/clipboard.js";
import { showToast } from "/assets/js/core/toast.js";

const typeGroup = document.getElementById("gradient-type-group");
const angleField = document.getElementById("gradient-angle-field");
const angleInput = document.getElementById("gradient-angle");
const angleValueEl = document.getElementById("gradient-angle-value");
const shapeField = document.getElementById("gradient-shape-field");
const shapeGroup = document.getElementById("gradient-shape-group");
const stopsContainer = document.getElementById("gradient-stops");
const errorBox = document.getElementById("gradient-error");
const preview = document.getElementById("gradient-preview");
const output = document.getElementById("gradient-output");

let type = "linear";
let shape = "circle";

initRadioGroup(typeGroup, (radio) => {
  type = radio.dataset.type;
  angleField.classList.toggle("hidden", type !== "linear");
  shapeField.classList.toggle("hidden", type !== "radial");
  render();
});
initRadioGroup(shapeGroup, (radio) => {
  shape = radio.dataset.shape;
  render();
});

function addStop(color, position) {
  const row = document.createElement("div");
  row.className = "gradient-stop flex items-center gap-2";
  row.innerHTML = `
    <input type="color" class="gradient-stop-color h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-border" value="${color}" />
    <input type="number" class="field-input gradient-stop-position w-20" value="${position}" min="0" max="100" step="1" aria-label="Position (%)" />
    <span class="text-sm text-text-muted">%</span>
    <button type="button" class="btn-icon border border-border gradient-remove-stop ml-auto" aria-label="Remove stop">×</button>
  `;
  stopsContainer.appendChild(row);
}

function readStops() {
  return [...stopsContainer.querySelectorAll(".gradient-stop")].map((row) => ({
    color: row.querySelector(".gradient-stop-color").value,
    position: Number(row.querySelector(".gradient-stop-position").value),
  }));
}

function render() {
  const stops = readStops();
  const result = type === "linear" ? buildLinearGradient(stops, Number(angleInput.value)) : buildRadialGradient(stops, shape);

  angleValueEl.textContent = angleInput.value;

  if (!result.ok) {
    errorBox.textContent = result.error;
    errorBox.classList.remove("hidden");
    return;
  }
  errorBox.classList.add("hidden");
  preview.style.background = result.css;
  output.value = `background: ${result.css};`;
}

stopsContainer.addEventListener("input", render);
stopsContainer.addEventListener("click", (event) => {
  const removeButton = event.target.closest(".gradient-remove-stop");
  if (!removeButton) return;
  if (stopsContainer.querySelectorAll(".gradient-stop").length <= 2) {
    showToast("A gradient needs at least 2 color stops.", { variant: "info" });
    return;
  }
  removeButton.closest(".gradient-stop").remove();
  render();
});

document.getElementById("gradient-add-stop").addEventListener("click", () => {
  const currentCount = stopsContainer.querySelectorAll(".gradient-stop").length;
  const positions = evenlyDistributedPositions(currentCount + 1);
  addStop("#ffffff", positions[positions.length - 1]);
  render();
});

angleInput.addEventListener("input", render);

addStop("#2563eb", 0);
addStop("#7c3aed", 100);
render();

bindCopyButton(document.getElementById("gradient-copy"), () => output.value, {
  onCopied: (success) => {
    if (!output.value) return;
    if (!success) showToast("Couldn't copy — try selecting the text manually.", { variant: "danger" });
  },
});
