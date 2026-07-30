import { checkContrast } from "./logic.js";

const fgText = document.getElementById("contrast-fg");
const fgPicker = document.getElementById("contrast-fg-picker");
const bgText = document.getElementById("contrast-bg");
const bgPicker = document.getElementById("contrast-bg-picker");
const errorBox = document.getElementById("contrast-error");
const preview = document.getElementById("contrast-preview");
const ratioEl = document.getElementById("contrast-ratio");

const badges = {
  aaNormal: document.getElementById("contrast-aa-normal"),
  aaLarge: document.getElementById("contrast-aa-large"),
  aaaNormal: document.getElementById("contrast-aaa-normal"),
  aaaLarge: document.getElementById("contrast-aaa-large"),
};

function syncPickerFromText(textInput, pickerInput) {
  if (/^#[0-9a-f]{6}$/i.test(textInput.value)) pickerInput.value = textInput.value;
}

function render() {
  const result = checkContrast(fgText.value, bgText.value);
  if (!result.ok) {
    errorBox.textContent = result.error;
    errorBox.classList.remove("hidden");
    ratioEl.textContent = "—";
    Object.values(badges).forEach((el) => (el.textContent = "—"));
    return;
  }
  errorBox.classList.add("hidden");
  syncPickerFromText(fgText, fgPicker);
  syncPickerFromText(bgText, bgPicker);

  preview.style.color = fgText.value;
  preview.style.backgroundColor = bgText.value;
  ratioEl.textContent = `${result.ratio.toFixed(2)}:1`;

  Object.entries(badges).forEach(([key, el]) => {
    const passed = result.compliance[key];
    el.textContent = passed ? "✓ Pass" : "✗ Fail";
    el.className = `font-semibold ${passed ? "text-success" : "text-danger"}`;
  });
}

fgText.addEventListener("input", render);
bgText.addEventListener("input", render);
fgPicker.addEventListener("input", () => {
  fgText.value = fgPicker.value;
  render();
});
bgPicker.addEventListener("input", () => {
  bgText.value = bgPicker.value;
  render();
});

render();
