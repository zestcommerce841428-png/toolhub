/**
 * Theme (light/dark/system) management.
 *
 * IMPORTANT: this module runs *after* first paint (ES modules are deferred
 * by default), so it is NOT what prevents flash-of-wrong-theme. That job
 * belongs to the tiny synchronous inline script in
 * templates/partials/head-theme-bootstrap.html, which runs blocking, before
 * any CSS paints, and sets the same [data-theme] attribute this module
 * manages afterward. Keep both in sync if the storage key ever changes.
 */

import { getItem, setItem } from "./storage.js";

const STORAGE_KEY = "theme"; // "light" | "dark" | "system"
const root = document.documentElement;

/** Returns the user's stored preference, defaulting to "system". */
export function getStoredPreference() {
  return getItem(STORAGE_KEY, "system");
}

/** Returns the currently *applied* theme ("light" or "dark"), resolving "system". */
export function getAppliedTheme() {
  const preference = getStoredPreference();
  if (preference === "light" || preference === "dark") return preference;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme) {
  if (theme === "system") {
    root.removeAttribute("data-theme");
  } else {
    root.setAttribute("data-theme", theme);
  }
}

/**
 * Sets and persists the theme preference.
 * @param {"light"|"dark"|"system"} preference
 */
export function setThemePreference(preference) {
  setItem(STORAGE_KEY, preference);
  applyTheme(preference);
  document.dispatchEvent(new CustomEvent("toolhub:theme-change", { detail: { preference } }));
}

/** Cycles light -> dark -> light (system is only reachable by clearing storage, e.g. via a future settings panel). */
export function toggleTheme() {
  const next = getAppliedTheme() === "dark" ? "light" : "dark";
  setThemePreference(next);
  return next;
}

/**
 * Wires a toggle button: click cycles the theme, and its aria-pressed /
 * label stay in sync with the applied theme, including when the OS-level
 * preference changes while "system" is selected.
 * @param {HTMLElement} button
 */
export function initThemeToggle(button) {
  function sync() {
    const applied = getAppliedTheme();
    const isDark = applied === "dark";
    button.setAttribute("aria-pressed", String(isDark));
    button.setAttribute(
      "aria-label",
      isDark ? "Switch to light theme" : "Switch to dark theme"
    );
    button.dataset.theme = applied;
  }

  button.addEventListener("click", () => {
    toggleTheme();
    sync();
  });

  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", () => {
    if (getStoredPreference() === "system") sync();
  });

  sync();
}
