import { md5 } from "./logic.js";
import { bindCopyButton } from "/assets/js/core/clipboard.js";
import { showToast } from "/assets/js/core/toast.js";

const input = document.getElementById("md5-input");
const uppercaseCheckbox = document.getElementById("md5-uppercase");
const output = document.getElementById("md5-output");

function render() {
  const hash = md5(input.value);
  output.value = uppercaseCheckbox.checked ? hash.toUpperCase() : hash;
}

input.addEventListener("input", render);
uppercaseCheckbox.addEventListener("change", render);

bindCopyButton(document.getElementById("md5-copy"), () => output.value, {
  onCopied: (success) => {
    if (!success) showToast("Couldn't copy — try selecting the hash manually.", { variant: "danger" });
  },
});

render();
