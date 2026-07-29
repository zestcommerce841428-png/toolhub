/**
 * Clipboard helper shared by every "Copy" button on the site.
 * Prefers the async Clipboard API; falls back to a hidden-textarea +
 * execCommand for browsers/contexts where navigator.clipboard is
 * unavailable (e.g. non-secure contexts, older WebViews).
 */

/**
 * Copies `text` to the system clipboard.
 * @param {string} text
 * @returns {Promise<boolean>} true on success, false if copying failed.
 */
export async function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to the legacy path — some browsers reject
      // programmatic writes outside a direct user gesture.
    }
  }
  return legacyCopy(text);
}

function legacyCopy(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "-1000px";
  textarea.style.left = "-1000px";
  document.body.appendChild(textarea);
  const previousFocus = document.activeElement;
  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);

  let succeeded = false;
  try {
    succeeded = document.execCommand("copy");
  } catch {
    succeeded = false;
  }

  document.body.removeChild(textarea);
  if (previousFocus instanceof HTMLElement) previousFocus.focus();
  return succeeded;
}

/**
 * Reads text from the clipboard, if the browser and permissions allow it.
 * Returns null rather than throwing when unavailable/denied.
 * @returns {Promise<string|null>}
 */
export async function readFromClipboard() {
  if (!navigator.clipboard?.readText || !window.isSecureContext) return null;
  try {
    return await navigator.clipboard.readText();
  } catch {
    return null;
  }
}

/**
 * Wires a button to copy `getText()`'s return value and swap its label to
 * a confirmation state briefly. Returns a cleanup function.
 * @param {HTMLElement} button
 * @param {() => string} getText
 * @param {{ onCopied?: (success: boolean) => void, resetAfterMs?: number }} [options]
 */
export function bindCopyButton(button, getText, options = {}) {
  const { onCopied, resetAfterMs = 1600 } = options;
  const originalLabel = button.textContent;
  let resetTimer;

  async function handleClick() {
    const text = getText();
    if (!text) return;
    const success = await copyToClipboard(text);
    onCopied?.(success);

    button.textContent = success ? "Copied!" : "Copy failed";
    button.setAttribute("aria-live", "polite");
    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => {
      button.textContent = originalLabel;
    }, resetAfterMs);
  }

  button.addEventListener("click", handleClick);
  return () => {
    button.removeEventListener("click", handleClick);
    clearTimeout(resetTimer);
  };
}
