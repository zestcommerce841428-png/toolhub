import { parseUrlLines, buildSitemapXml } from "./logic.js";
import { bindCopyButton } from "/assets/js/core/clipboard.js";
import { downloadText } from "/assets/js/core/download.js";
import { showToast } from "/assets/js/core/toast.js";
import { escapeHtml } from "/assets/js/core/utility.js";

const urlsInput = document.getElementById("sitemap-urls");
const errorsBox = document.getElementById("sitemap-errors");
const output = document.getElementById("sitemap-output");

function render() {
  const { entries, errors } = parseUrlLines(urlsInput.value);
  errorsBox.innerHTML = errors.map((error) => `<p>${escapeHtml(error)}</p>`).join("");
  output.value = entries.length > 0 ? buildSitemapXml(entries) : "";
}

urlsInput.addEventListener("input", render);

bindCopyButton(document.getElementById("sitemap-copy"), () => output.value, {
  onCopied: (success) => {
    if (!output.value) return;
    if (!success) showToast("Couldn't copy — try selecting the text manually.", { variant: "danger" });
  },
});

document.getElementById("sitemap-download").addEventListener("click", () => {
  if (!output.value) {
    showToast("Add at least one valid URL first.", { variant: "info" });
    return;
  }
  downloadText("sitemap.xml", output.value, "application/xml;charset=utf-8");
});

render();
