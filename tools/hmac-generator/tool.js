import { computeHmac } from "./logic.js";
import { bindCopyButton } from "/assets/js/core/clipboard.js";
import { showToast } from "/assets/js/core/toast.js";

const messageInput = document.getElementById("hmac-message");
const secretInput = document.getElementById("hmac-secret");
const algorithmSelect = document.getElementById("hmac-algorithm");
const output = document.getElementById("hmac-output");

async function render() {
  // An HMAC key can't be empty — crypto.subtle.importKey throws on a
  // zero-length key, so wait for a secret before computing anything
  // rather than letting that surface as an uncaught error.
  if (!secretInput.value) {
    output.value = "";
    return;
  }
  output.value = await computeHmac(messageInput.value, secretInput.value, algorithmSelect.value);
}

[messageInput, secretInput, algorithmSelect].forEach((el) => el.addEventListener("input", render));

bindCopyButton(document.getElementById("hmac-copy"), () => output.value, {
  onCopied: (success) => {
    if (!output.value) return;
    if (!success) showToast("Couldn't copy — try selecting the digest manually.", { variant: "danger" });
  },
});

render();
