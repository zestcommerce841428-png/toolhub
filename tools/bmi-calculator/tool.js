import { calculateBmi, classifyBmi, feetInchesToCm, lbsToKg } from "./logic.js";

const unitGroup = document.getElementById("bmi-unit-group");
const unitRadios = [...unitGroup.querySelectorAll('[role="radio"]')];
const fieldGroups = {
  metric: [...document.querySelectorAll('[data-unit-fields="metric"]')],
  imperial: [...document.querySelectorAll('[data-unit-fields="imperial"]')],
};

const heightCmInput = document.getElementById("bmi-height-cm");
const weightKgInput = document.getElementById("bmi-weight-kg");
const heightFtInput = document.getElementById("bmi-height-ft");
const heightInInput = document.getElementById("bmi-height-in");
const weightLbInput = document.getElementById("bmi-weight-lb");

const errorEl = document.getElementById("bmi-error");
const valueEl = document.getElementById("bmi-value");
const categoryEl = document.getElementById("bmi-category");
const markerEl = document.getElementById("bmi-scale-marker");

const CATEGORY_CLASSES = {
  info: "border-info/30 bg-info/10 text-info",
  success: "border-success/30 bg-success/10 text-success",
  warning: "border-warning/30 bg-warning/10 text-warning",
  danger: "border-danger/30 bg-danger/10 text-danger",
};

let unit = "metric";

function selectUnit(nextRadio) {
  unitRadios.forEach((radio) => {
    const isSelected = radio === nextRadio;
    radio.setAttribute("aria-checked", String(isSelected));
    radio.tabIndex = isSelected ? 0 : -1;
    radio.classList.toggle("btn-primary", isSelected);
    radio.classList.toggle("btn-secondary", !isSelected);
  });
  unit = nextRadio.dataset.unit;
  fieldGroups.metric.forEach((el) => (el.hidden = unit !== "metric"));
  fieldGroups.imperial.forEach((el) => (el.hidden = unit !== "imperial"));
  compute();
}

unitGroup.addEventListener("click", (event) => {
  const radio = event.target.closest('[role="radio"]');
  if (radio) selectUnit(radio);
});

unitGroup.addEventListener("keydown", (event) => {
  if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
  event.preventDefault();
  const currentIndex = unitRadios.findIndex((radio) => radio.getAttribute("aria-checked") === "true");
  const direction = event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 1;
  const next = unitRadios[(currentIndex + direction + unitRadios.length) % unitRadios.length];
  selectUnit(next);
  next.focus();
});

function currentHeightAndWeightCm() {
  if (unit === "metric") {
    return { heightCm: Number(heightCmInput.value), weightKg: Number(weightKgInput.value) };
  }
  const feet = Number(heightFtInput.value);
  const inches = Number(heightInInput.value);
  const lbs = Number(weightLbInput.value);
  return { heightCm: feetInchesToCm(feet, inches), weightKg: lbsToKg(lbs) };
}

function compute() {
  const { heightCm, weightKg } = currentHeightAndWeightCm();
  const result = calculateBmi({ heightCm, weightKg });

  if (!result.ok) {
    errorEl.textContent = result.error;
    errorEl.classList.remove("hidden");
    valueEl.textContent = "—";
    categoryEl.textContent = "";
    categoryEl.className = "badge mt-2";
    markerEl.style.marginLeft = "0%";
    return;
  }

  errorEl.classList.add("hidden");
  valueEl.textContent = result.bmi.toFixed(1);

  const { category, colorKey } = classifyBmi(result.bmi);
  categoryEl.textContent = category;
  categoryEl.className = `badge mt-2 ${CATEGORY_CLASSES[colorKey]}`;

  const SCALE_MIN = 15;
  const SCALE_MAX = 40;
  const percent = Math.min(100, Math.max(0, ((result.bmi - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 100));
  markerEl.style.marginLeft = `${percent}%`;
}

[heightCmInput, weightKgInput, heightFtInput, heightInInput, weightLbInput].forEach((input) => {
  input.addEventListener("input", compute);
});

compute();
