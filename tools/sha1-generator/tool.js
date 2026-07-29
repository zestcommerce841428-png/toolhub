import { sha1 } from "./logic.js";
import { bindCopyButton } from "/assets/js/core/clipboard.js";
import { showToast } from "/assets/js/core/toast.js";

const input = document.getElementById("sha1-input");
const uppercaseCheckbox = document.getElementById("sha1-uppercase");
const output = document.getElementById("sha1-output");

async function render() {
  const hash = await sha1(input.value);
  output.value = uppercaseCheckbox.checked ? hash.toUpperCase() : hash;
}

input.addEventListener("input", render);
uppercaseCheckbox.addEventListener("change", render);

bindCopyButton(document.getElementById("sha1-copy"), () => output.value, {
  onCopied: (success) => {
    if (!success) showToast("Couldn't copy — try selecting the hash manually.", { variant: "danger" });
  },
});

render();
