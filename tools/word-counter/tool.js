import { computeTextStats, formatDuration } from "./logic.js";
import { bindCopyButton } from "/assets/js/core/clipboard.js";
import { downloadText } from "/assets/js/core/download.js";
import { debounce, pluralize } from "/assets/js/core/utility.js";
import { showToast } from "/assets/js/core/toast.js";

const input = document.getElementById("word-counter-input");
const statusEl = document.getElementById("word-counter-status");

const statEls = {
  words: document.getElementById("stat-words"),
  characters: document.getElementById("stat-characters"),
  charactersNoSpaces: document.getElementById("stat-characters-no-spaces"),
  sentences: document.getElementById("stat-sentences"),
  paragraphs: document.getElementById("stat-paragraphs"),
  readingTime: document.getElementById("stat-reading-time"),
  speakingTime: document.getElementById("stat-speaking-time"),
};

function render() {
  const stats = computeTextStats(input.value);
  statEls.words.textContent = stats.words.toLocaleString();
  statEls.characters.textContent = stats.characters.toLocaleString();
  statEls.charactersNoSpaces.textContent = stats.charactersNoSpaces.toLocaleString();
  statEls.sentences.textContent = stats.sentences.toLocaleString();
  statEls.paragraphs.textContent = stats.paragraphs.toLocaleString();
  statEls.readingTime.textContent = formatDuration(stats.readingTimeSeconds);
  statEls.speakingTime.textContent = formatDuration(stats.speakingTimeSeconds);
  return stats;
}

const announce = debounce((stats) => {
  statusEl.textContent = `${pluralize(stats.words, "word")}, ${pluralize(stats.characters, "character")}.`;
}, 500);

input.addEventListener("input", () => {
  announce(render());
});

document.getElementById("word-counter-clear").addEventListener("click", () => {
  input.value = "";
  render();
  input.focus();
});

document.getElementById("word-counter-download").addEventListener("click", () => {
  if (!input.value) {
    showToast("Nothing to download yet.", { variant: "info" });
    return;
  }
  downloadText("word-counter-text.txt", input.value);
});

bindCopyButton(document.getElementById("word-counter-copy"), () => input.value, {
  onCopied: (success) => {
    if (!success) showToast("Couldn't copy — try selecting the text manually.", { variant: "danger" });
  },
});

render();
