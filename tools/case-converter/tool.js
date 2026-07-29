import { CASE_MODES } from "./logic.js";
import { bindCopyButton } from "/assets/js/core/clipboard.js";
import { downloadText } from "/assets/js/core/download.js";
import { showToast } from "/assets/js/core/toast.js";

const input = document.getElementById("case-converter-input");
const output = document.getElementById("case-converter-output");
const group = document.getElementById("case-mode-group");
const radios = [...group.querySelectorAll('[role="radio"]')];

const modeById = new Map(CASE_MODES.map((mode) => [mode.id, mode]));
let activeMode = CASE_MODES[0];

function render() {
  output.value = activeMode.transform(input.value);
}

function selectMode(nextRadio, { focus = false } = {}) {
  radios.forEach((radio) => {
    const isSelected = radio === nextRadio;
    radio.setAttribute("aria-checked", String(isSelected));
    radio.tabIndex = isSelected ? 0 : -1;
    radio.classList.toggle("btn-primary", isSelected);
    radio.classList.toggle("btn-secondary", !isSelected);
  });
  activeMode = modeById.get(nextRadio.dataset.mode);
  if (focus) nextRadio.focus();
  render();
}

group.addEventListener("click", (event) => {
  const radio = event.target.closest('[role="radio"]');
  if (radio) selectMode(radio);
});

group.addEventListener("keydown", (event) => {
  const currentIndex = radios.findIndex((radio) => radio.getAttribute("aria-checked") === "true");
  let nextIndex = currentIndex;

  if (event.key === "ArrowRight" || event.key === "ArrowDown") {
    nextIndex = (currentIndex + 1) % radios.length;
  } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
    nextIndex = (currentIndex - 1 + radios.length) % radios.length;
  } else if (event.key === "Home") {
    nextIndex = 0;
  } else if (event.key === "End") {
    nextIndex = radios.length - 1;
  } else {
    return;
  }

  event.preventDefault();
  selectMode(radios[nextIndex], { focus: true });
});

input.addEventListener("input", render);

document.getElementById("case-converter-clear").addEventListener("click", () => {
  input.value = "";
  render();
  input.focus();
});

document.getElementById("case-converter-download").addEventListener("click", () => {
  if (!output.value) {
    showToast("Nothing to download yet.", { variant: "info" });
    return;
  }
  downloadText("converted-text.txt", output.value);
});

bindCopyButton(document.getElementById("case-converter-copy"), () => output.value, {
  onCopied: (success) => {
    if (!success) showToast("Couldn't copy — try selecting the result manually.", { variant: "danger" });
  },
});

render();
