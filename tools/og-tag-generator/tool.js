import { buildOgTags, checkImageDimensions } from "./logic.js";
import { bindCopyButton } from "/assets/js/core/clipboard.js";
import { showToast } from "/assets/js/core/toast.js";

const fieldIds = {
  type: "og-type",
  title: "og-title",
  description: "og-description",
  url: "og-url",
  siteName: "og-site-name",
  locale: "og-locale",
  twitterHandle: "og-twitter-handle",
  twitterCard: "og-twitter-card",
  imageUrl: "og-image-url",
  imageWidth: "og-image-width",
  imageHeight: "og-image-height",
  articleAuthor: "og-article-author",
  articlePublishedTime: "og-article-published",
  productPriceAmount: "og-product-price",
  productPriceCurrency: "og-product-currency",
};
const elements = Object.fromEntries(Object.entries(fieldIds).map(([key, id]) => [key, document.getElementById(id)]));

const typeSelect = elements.type;
const output = document.getElementById("og-output");
const imageHint = document.getElementById("og-image-hint");

function updateVisibleTypeFields() {
  document.querySelectorAll("[data-og-fields]").forEach((section) => {
    section.hidden = section.dataset.ogFields !== typeSelect.value;
  });
}

function render() {
  updateVisibleTypeFields();
  const fields = Object.fromEntries(Object.entries(elements).map(([key, el]) => [key, el.value]));
  output.value = buildOgTags(fields);

  const hint = checkImageDimensions(elements.imageWidth.value, elements.imageHeight.value);
  imageHint.textContent = hint.message;
  imageHint.className = `field-hint mt-2 ${hint.status === "good" ? "text-success" : hint.status === "warning" ? "text-warning" : "text-text-muted"}`;
}

Object.values(elements).forEach((el) => el.addEventListener("input", render));
typeSelect.addEventListener("change", render);

bindCopyButton(document.getElementById("og-copy"), () => output.value, {
  onCopied: (success) => {
    if (!output.value) return;
    if (!success) showToast("Couldn't copy — try selecting the text manually.", { variant: "danger" });
  },
});

render();
