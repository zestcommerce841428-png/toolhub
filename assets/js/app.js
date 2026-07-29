/**
 * Site-wide bootstrap loaded on every page (see templates/*.template.html).
 * Wires the chrome that's identical everywhere: theme toggle, header search,
 * and the Ctrl/Cmd+K shortcut. Tool-specific behavior lives in each tool's
 * own tool.js, never here.
 */
import { initThemeToggle } from "./core/theme.js";
import { initSearch } from "./core/search.js";
import { registerShortcut } from "./core/keyboard.js";

function initThemeToggleButton() {
  const button = document.querySelector("[data-theme-toggle]");
  if (button) initThemeToggle(button);
}

function initHeaderSearch() {
  const inputEl = document.getElementById("site-search-input");
  const resultsEl = document.getElementById("site-search-results");
  if (!(inputEl instanceof HTMLInputElement) || !resultsEl) return;

  initSearch({
    inputEl,
    resultsEl,
    onNavigate: (tool) => {
      window.location.href = `/tools/${tool.slug}/`;
    },
  });

  registerShortcut("mod+k", () => {
    inputEl.focus();
    inputEl.select();
  }, { description: "Focus search", allowInFields: true });
}

function initFooterYear() {
  const el = document.getElementById("current-year");
  if (el) el.textContent = String(new Date().getFullYear());
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Offline support is a progressive enhancement — a failed registration
      // (e.g. unsupported browser policy) should never block the page.
    });
  });
}

initThemeToggleButton();
initHeaderSearch();
initFooterYear();
registerServiceWorker();
