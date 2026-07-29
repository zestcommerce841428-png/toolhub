import { decodeJwt, verifyHmacSignature, formatClaimTimestamp } from "./logic.js";
import { escapeHtml } from "/assets/js/core/utility.js";

const input = document.getElementById("jwt-input");
const errorBox = document.getElementById("jwt-error");
const headerBox = document.getElementById("jwt-header");
const payloadBox = document.getElementById("jwt-payload");
const claimsBox = document.getElementById("jwt-claims");
const secretInput = document.getElementById("jwt-secret");
const verifyResult = document.getElementById("jwt-verify-result");

const TIME_CLAIMS = { exp: "Expires", iat: "Issued at", nbf: "Not valid before" };

function render() {
  verifyResult.textContent = "";
  const decoded = decodeJwt(input.value);

  if (!decoded.ok) {
    errorBox.textContent = input.value.trim() ? decoded.error : "";
    headerBox.textContent = "—";
    payloadBox.textContent = "—";
    claimsBox.innerHTML = "";
    return;
  }

  errorBox.textContent = "";
  headerBox.textContent = JSON.stringify(decoded.header, null, 2);
  payloadBox.textContent = JSON.stringify(decoded.payload, null, 2);

  claimsBox.innerHTML = Object.entries(TIME_CLAIMS)
    .filter(([claim]) => Number.isFinite(decoded.payload[claim]))
    .map(
      ([claim, label]) => `
      <div class="flex justify-between gap-3">
        <dt>${escapeHtml(label)} (${claim})</dt>
        <dd class="font-mono">${escapeHtml(formatClaimTimestamp(decoded.payload[claim]))}</dd>
      </div>`
    )
    .join("");
}

input.addEventListener("input", render);

document.getElementById("jwt-verify").addEventListener("click", async () => {
  if (!input.value.trim()) {
    verifyResult.textContent = "Paste a JWT first.";
    verifyResult.className = "mt-2 text-sm text-text-muted";
    return;
  }
  const outcome = await verifyHmacSignature(input.value, secretInput.value);
  if (!outcome.ok) {
    verifyResult.textContent = outcome.error;
    verifyResult.className = "mt-2 text-sm text-danger";
    return;
  }
  verifyResult.textContent = outcome.valid ? "✓ Signature is valid for this secret." : "✗ Signature does not match this secret.";
  verifyResult.className = `mt-2 text-sm font-medium ${outcome.valid ? "text-success" : "text-danger"}`;
});

render();
