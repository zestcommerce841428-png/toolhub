/**
 * Global keyboard shortcut registry. Shortcuts are ignored while the user is
 * typing in a text field/textarea/select/contenteditable, *unless* the
 * binding is registered with allowInFields: true (e.g. Escape, Ctrl/Cmd+K).
 */

const registry = new Map(); // normalized combo -> { handler, description, allowInFields }
let listening = false;

function normalizeCombo(combo) {
  return combo
    .toLowerCase()
    .split("+")
    .map((part) => part.trim())
    .map((part) => (part === "cmd" || part === "meta" ? "mod" : part))
    .map((part) => (part === "ctrl" || part === "control" ? "mod" : part))
    .sort()
    .join("+");
}

function comboFromEvent(event) {
  const parts = [];
  if (event.metaKey || event.ctrlKey) parts.push("mod");
  if (event.altKey) parts.push("alt");
  if (event.shiftKey) parts.push("shift");
  const key = event.key.toLowerCase();
  if (!["control", "meta", "alt", "shift"].includes(key)) parts.push(key);
  return parts.sort().join("+");
}

function isTypingTarget(target) {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable
  );
}

function handleKeydown(event) {
  const combo = comboFromEvent(event);
  const entry = registry.get(combo);
  if (!entry) return;
  if (isTypingTarget(event.target) && !entry.allowInFields) return;
  event.preventDefault();
  entry.handler(event);
}

function ensureListening() {
  if (listening) return;
  document.addEventListener("keydown", handleKeydown);
  listening = true;
}

/**
 * Registers a global shortcut, e.g. registerShortcut("mod+k", openSearch, { description: "Open search" }).
 * Combo syntax: "+"-joined tokens from { mod, alt, shift, <key> }. "mod" means Ctrl on
 * Windows/Linux and Cmd on macOS (the browser reports whichever the OS uses).
 * @param {string} combo
 * @param {(event: KeyboardEvent) => void} handler
 * @param {{ description?: string, allowInFields?: boolean }} [options]
 * @returns {() => void} unregister function
 */
export function registerShortcut(combo, handler, options = {}) {
  ensureListening();
  const normalized = normalizeCombo(combo);
  registry.set(normalized, {
    handler,
    description: options.description ?? "",
    allowInFields: options.allowInFields ?? false,
  });
  return () => registry.delete(normalized);
}

/** Returns all registered shortcuts, for a future "keyboard shortcuts" help panel. */
export function listShortcuts() {
  return [...registry.entries()].map(([combo, entry]) => ({
    combo,
    description: entry.description,
  }));
}
