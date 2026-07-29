import { buildRobotsTxt } from "./logic.js";
import { bindCopyButton } from "/assets/js/core/clipboard.js";
import { downloadText } from "/assets/js/core/download.js";
import { showToast } from "/assets/js/core/toast.js";

const output = document.getElementById("robots-output");
const sitemapsInput = document.getElementById("robots-sitemaps");

function readGroup(suffix) {
  return {
    userAgent: document.getElementById(`robots-agent-${suffix}`).value,
    disallow: document.getElementById(`robots-disallow-${suffix}`).value.split("\n"),
    allow: document.getElementById(`robots-allow-${suffix}`).value.split("\n"),
    crawlDelay: Number(document.getElementById(`robots-delay-${suffix}`).value) || null,
  };
}

function render() {
  const groups = [readGroup(1), readGroup(2)];
  const sitemapUrls = sitemapsInput.value.split("\n");
  output.value = buildRobotsTxt(groups, sitemapUrls);
}

document.querySelectorAll("input, textarea").forEach((el) => el.addEventListener("input", render));

bindCopyButton(document.getElementById("robots-copy"), () => output.value, {
  onCopied: (success) => {
    if (!success) showToast("Couldn't copy — try selecting the text manually.", { variant: "danger" });
  },
});

document.getElementById("robots-download").addEventListener("click", () => {
  downloadText("robots.txt", output.value, "text/plain;charset=utf-8");
});

render();
