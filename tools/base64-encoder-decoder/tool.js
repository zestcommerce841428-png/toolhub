import { encodeBase64, decodeBase64 } from "./logic.js";
import { bindCopyButton } from "/assets/js/core/clipboard.js";
import { downloadText } from "/assets/js/core/download.js";
import { showToast } from "/assets/js/core/toast.js";

const modeGroup = document.getElementById("base64-mode-group");
const modeRadios = [...modeGroup.querySelectorAll('[role="radio"]')];
const inputLabel = document.getElementById("base64-input-label");
const outputLabel = document.getElementById("base64-output-label");
const input = document.getElementById("base64-input");
const output = document.getElementById("base64-output");
const errorEl = document.getElementById("base64-error");

let mode = "encode";

function selectMode(nextRadio, { focus = false } = {}) {
  modeRadios.forEach((radio) => {
    const isSelected = radio === nextRadio;
    radio.setAttribute("aria-checked", String(isSelected));
    radio.tabIndex = isSelected ? 0 : -1;
    radio.classList.toggle("btn-primary", isSelected);
    radio.classList.toggle("btn-secondary", !isSelected);
  });
  mode = nextRadio.dataset.mode;
  inputLabel.textContent = mode === "encode" ? "Text" : "Base64";
  outputLabel.textContent = mode === "encode" ? "Base64" : "Text";
  if (focus) nextRadio.focus();
  render();
}

modeGroup.addEventListener("click", (event) => {
  const radio = event.target.closest('[role="radio"]');
  if (radio) selectMode(radio);
});

modeGroup.addEventListener("keydown", (event) => {
  if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
  event.preventDefault();
  const currentIndex = modeRadios.findIndex((radio) => radio.getAttribute("aria-checked") === "true");
  const direction = event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 1;
  selectMode(modeRadios[(currentIndex + direction + modeRadios.length) % modeRadios.length], { focus: true });
});

function render() {
  if (!input.value) {
    output.value = "";
    errorEl.classList.add("hidden");
    return;
  }
  const result = mode === "encode" ? encodeBase64(input.value) : decodeBase64(input.value);
  if (result.ok) {
    output.value = result.value;
    errorEl.classList.add("hidden");
  } else {
    output.value = "";
    errorEl.textContent = result.error;
    errorEl.classList.remove("hidden");
  }
}

input.addEventListener("input", render);

document.getElementById("base64-swap").addEventListener("click", () => {
  const previousOutput = output.value;
  selectMode(mode === "encode" ? modeRadios[1] : modeRadios[0]);
  input.value = previousOutput;
  render();
});

document.getElementById("base64-clear").addEventListener("click", () => {
  input.value = "";
  render();
  input.focus();
});

document.getElementById("base64-download").addEventListener("click", () => {
  if (!output.value) {
    showToast("Nothing to download yet.", { variant: "info" });
    return;
  }
  downloadText(mode === "encode" ? "encoded.base64.txt" : "decoded.txt", output.value);
});

bindCopyButton(document.getElementById("base64-copy"), () => output.value, {
  onCopied: (success) => {
    if (!output.value) return;
    if (!success) showToast("Couldn't copy — try selecting the result manually.", { variant: "danger" });
  },
});
