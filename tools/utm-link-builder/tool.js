import { buildUtmUrl } from "./logic.js";
import { bindCopyButton } from "/assets/js/core/clipboard.js";
import { showToast } from "/assets/js/core/toast.js";

const baseUrlInput = document.getElementById("utm-base-url");
const fieldIds = ["utm-source", "utm-medium", "utm-campaign", "utm-term", "utm-content"];
const fields = Object.fromEntries(fieldIds.map((id) => [id.replace("utm-", "utm_"), document.getElementById(id)]));
const errorBox = document.getElementById("utm-error");
const output = document.getElementById("utm-output");

function render() {
  if (!baseUrlInput.value.trim()) {
    output.value = "";
    errorBox.classList.add("hidden");
    return;
  }
  const params = Object.fromEntries(Object.entries(fields).map(([key, el]) => [key, el.value]));
  const result = buildUtmUrl(baseUrlInput.value, params);

  if (!result.ok) {
    output.value = "";
    errorBox.textContent = result.error;
    errorBox.classList.remove("hidden");
    return;
  }
  errorBox.classList.add("hidden");
  output.value = result.url;
}

[baseUrlInput, ...Object.values(fields)].forEach((el) => el.addEventListener("input", render));

bindCopyButton(document.getElementById("utm-copy"), () => output.value, {
  onCopied: (success) => {
    if (!output.value) return;
    if (!success) showToast("Couldn't copy — try selecting the URL manually.", { variant: "danger" });
  },
});

render();
