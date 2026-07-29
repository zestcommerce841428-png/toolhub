import { buildMetaTags, analyzeTitle, analyzeDescription } from "./logic.js";
import { bindCopyButton } from "/assets/js/core/clipboard.js";
import { downloadText } from "/assets/js/core/download.js";
import { showToast } from "/assets/js/core/toast.js";

const fields = {
  title: document.getElementById("meta-title"),
  description: document.getElementById("meta-description"),
  url: document.getElementById("meta-url"),
  imageUrl: document.getElementById("meta-image"),
  siteName: document.getElementById("meta-site-name"),
  twitterHandle: document.getElementById("meta-twitter"),
};
const titleHint = document.getElementById("meta-title-hint");
const descriptionHint = document.getElementById("meta-description-hint");
const output = document.getElementById("meta-output");

const HINT_CLASSES = {
  empty: "text-text-subtle",
  warning: "text-warning",
  good: "text-success",
};

function applyHint(el, analysis) {
  el.textContent = analysis.message;
  el.className = `field-hint ${HINT_CLASSES[analysis.status]}`;
}

function render() {
  applyHint(titleHint, analyzeTitle(fields.title.value));
  applyHint(descriptionHint, analyzeDescription(fields.description.value));

  output.value = buildMetaTags({
    title: fields.title.value.trim(),
    description: fields.description.value.trim(),
    url: fields.url.value.trim(),
    imageUrl: fields.imageUrl.value.trim(),
    siteName: fields.siteName.value.trim(),
    twitterHandle: fields.twitterHandle.value.trim(),
  });
}

Object.values(fields).forEach((input) => input.addEventListener("input", render));

document.getElementById("meta-download").addEventListener("click", () => {
  if (!output.value) {
    showToast("Fill in at least a title to generate tags.", { variant: "info" });
    return;
  }
  downloadText("meta-tags.html", output.value);
});

bindCopyButton(document.getElementById("meta-copy"), () => output.value, {
  onCopied: (success) => {
    if (!output.value) return;
    if (!success) showToast("Couldn't copy — try selecting the text manually.", { variant: "danger" });
  },
});

render();
