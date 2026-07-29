import { generateUuids } from "./logic.js";
import { bindCopyButton } from "/assets/js/core/clipboard.js";
import { downloadText } from "/assets/js/core/download.js";
import { showToast } from "/assets/js/core/toast.js";

const countInput = document.getElementById("uuid-count");
const uppercaseCheckbox = document.getElementById("uuid-uppercase");
const hyphensCheckbox = document.getElementById("uuid-hyphens");
const output = document.getElementById("uuid-output");

function generate() {
  const count = Math.min(100, Math.max(1, Math.round(Number(countInput.value)) || 1));
  countInput.value = String(count);
  const uuids = generateUuids(count, {
    uppercase: uppercaseCheckbox.checked,
    hyphens: hyphensCheckbox.checked,
  });
  output.value = uuids.join("\n");
}

document.getElementById("uuid-generate").addEventListener("click", generate);
uppercaseCheckbox.addEventListener("change", generate);
hyphensCheckbox.addEventListener("change", generate);

document.getElementById("uuid-download").addEventListener("click", () => {
  if (!output.value) {
    showToast("Generate some UUIDs first.", { variant: "info" });
    return;
  }
  downloadText("uuids.txt", output.value);
});

bindCopyButton(document.getElementById("uuid-copy"), () => output.value, {
  onCopied: (success) => {
    if (!output.value) return;
    if (!success) showToast("Couldn't copy — try selecting the text manually.", { variant: "danger" });
  },
});

generate();
