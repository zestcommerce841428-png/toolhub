import { formatJson, minifyJson } from "./logic.js";
import { bindCopyButton } from "/assets/js/core/clipboard.js";
import { downloadText } from "/assets/js/core/download.js";
import { showToast } from "/assets/js/core/toast.js";

const input = document.getElementById("json-input");
const indentSelect = document.getElementById("json-indent");
const statusEl = document.getElementById("json-status");

function currentIndent() {
  const raw = indentSelect.value;
  return raw === "tab" ? "\t" : Number(raw);
}

function setStatus(kind, message) {
  statusEl.textContent = message;
  statusEl.classList.remove(
    "border-border", "text-text-muted",
    "border-success/40", "text-success", "bg-success/5",
    "border-danger/40", "text-danger", "bg-danger/5"
  );
  if (kind === "success") {
    statusEl.classList.add("border-success/40", "text-success", "bg-success/5");
  } else if (kind === "error") {
    statusEl.classList.add("border-danger/40", "text-danger", "bg-danger/5");
  } else {
    statusEl.classList.add("border-border", "text-text-muted");
  }
}

function runFormat() {
  if (!input.value.trim()) {
    setStatus("neutral", "Paste or type JSON above, then choose Format or Minify.");
    return;
  }
  const result = formatJson(input.value, currentIndent());
  if (result.ok) {
    input.value = result.value;
    setStatus("success", `Valid JSON — formatted, ${result.value.length.toLocaleString()} characters.`);
  } else {
    const where = result.location ? ` (line ${result.location.line}, column ${result.location.column})` : "";
    setStatus("error", `Invalid JSON${where}: ${result.message}`);
  }
}

function runMinify() {
  if (!input.value.trim()) {
    setStatus("neutral", "Paste or type JSON above, then choose Format or Minify.");
    return;
  }
  const result = minifyJson(input.value);
  if (result.ok) {
    input.value = result.value;
    setStatus("success", `Valid JSON — minified, ${result.value.length.toLocaleString()} characters.`);
  } else {
    const where = result.location ? ` (line ${result.location.line}, column ${result.location.column})` : "";
    setStatus("error", `Invalid JSON${where}: ${result.message}`);
  }
}

document.getElementById("json-format").addEventListener("click", runFormat);
document.getElementById("json-minify").addEventListener("click", runMinify);

document.getElementById("json-clear").addEventListener("click", () => {
  input.value = "";
  setStatus("neutral", "Paste or type JSON above, then choose Format or Minify.");
  input.focus();
});

document.getElementById("json-download").addEventListener("click", () => {
  if (!input.value.trim()) {
    showToast("Nothing to download yet.", { variant: "info" });
    return;
  }
  downloadText("data.json", input.value, "application/json;charset=utf-8");
});

bindCopyButton(document.getElementById("json-copy"), () => input.value, {
  onCopied: (success) => {
    if (!success) showToast("Couldn't copy — try selecting the text manually.", { variant: "danger" });
  },
});
