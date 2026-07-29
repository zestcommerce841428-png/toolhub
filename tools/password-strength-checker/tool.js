import { analyzePassword } from "./logic.js";
import { escapeHtml } from "/assets/js/core/utility.js";

const input = document.getElementById("pwstrength-input");
const toggleButton = document.getElementById("pwstrength-toggle");
const labelEl = document.getElementById("pwstrength-label");
const entropyEl = document.getElementById("pwstrength-entropy");
const barEl = document.getElementById("pwstrength-bar");
const crackOfflineEl = document.getElementById("pwstrength-crack-offline");
const crackOnlineEl = document.getElementById("pwstrength-crack-online");
const warningsEl = document.getElementById("pwstrength-warnings");

const STRENGTH_META = {
  "Very weak": { width: 15, className: "bg-danger" },
  Weak: { width: 35, className: "bg-danger" },
  Fair: { width: 60, className: "bg-warning" },
  Strong: { width: 85, className: "bg-success" },
  "Very strong": { width: 100, className: "bg-success" },
};

function render() {
  const password = input.value;
  const result = analyzePassword(password);
  const meta = STRENGTH_META[result.label];

  labelEl.textContent = password ? result.label : "—";
  entropyEl.textContent = password ? `~${result.entropyBits} bits of entropy` : "";
  barEl.style.width = password ? `${meta.width}%` : "0%";
  barEl.className = `h-full rounded-full transition-all duration-normal ${meta.className}`;

  crackOfflineEl.textContent = password ? result.crackTimeOffline : "—";
  crackOnlineEl.textContent = password ? result.crackTimeOnline : "—";

  warningsEl.innerHTML = result.warnings.map((warning) => `<li>⚠ ${escapeHtml(warning)}</li>`).join("");
}

input.addEventListener("input", render);

toggleButton.addEventListener("click", () => {
  const isPassword = input.type === "password";
  input.type = isPassword ? "text" : "password";
  toggleButton.setAttribute("aria-pressed", String(isPassword));
  toggleButton.setAttribute("aria-label", isPassword ? "Hide password" : "Show password");
});

render();
