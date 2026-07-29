import { markdownToHtml } from "./logic.js";
import { bindCopyButton } from "/assets/js/core/clipboard.js";
import { showToast } from "/assets/js/core/toast.js";
import { debounce } from "/assets/js/core/utility.js";

const input = document.getElementById("md-input");
const preview = document.getElementById("md-preview");
const output = document.getElementById("md-output");

const DEFAULT_MARKDOWN = `# Welcome to ToolHub's Markdown converter

This runs **entirely in your browser** — nothing you type is sent anywhere.

- Supports *italic*, **bold**, and \`inline code\`
- Also [links](https://example.com) and images
- Plus fenced code blocks:

\`\`\`js
console.log("hello");
\`\`\`

> Try editing this text.
`;

function render() {
  // markdownToHtml() escapes every character of the input before turning
  // any of it into real tags, so the only HTML that ever reaches
  // innerHTML here is markup this converter generated itself — never raw
  // user input.
  const html = markdownToHtml(input.value);
  preview.innerHTML = html;
  output.value = html;
}

input.addEventListener("input", debounce(render, 100));

bindCopyButton(document.getElementById("md-copy"), () => output.value, {
  onCopied: (success) => {
    if (!output.value) return;
    if (!success) showToast("Couldn't copy — try selecting the text manually.", { variant: "danger" });
  },
});

input.value = DEFAULT_MARKDOWN;
render();
