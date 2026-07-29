/**
 * Small, dependency-free general helpers used across tools and modules.
 * Nothing here is tool-specific business logic — if a function only makes
 * sense for one tool, it belongs in that tool's tool.js, not here.
 */

/**
 * Delays invoking `fn` until `wait` ms have elapsed since the last call.
 * @param {Function} fn
 * @param {number} wait
 */
export function debounce(fn, wait = 200) {
  let timerId;
  return function debounced(...args) {
    clearTimeout(timerId);
    timerId = setTimeout(() => fn.apply(this, args), wait);
  };
}

/**
 * Ensures `fn` runs at most once per `wait` ms, trailing-edge included.
 * @param {Function} fn
 * @param {number} wait
 */
export function throttle(fn, wait = 200) {
  let lastCall = 0;
  let timerId;
  return function throttled(...args) {
    const now = Date.now();
    const remaining = wait - (now - lastCall);
    if (remaining <= 0) {
      clearTimeout(timerId);
      lastCall = now;
      fn.apply(this, args);
    } else {
      clearTimeout(timerId);
      timerId = setTimeout(() => {
        lastCall = Date.now();
        fn.apply(this, args);
      }, remaining);
    }
  };
}

/** Clamps `value` between `min` and `max` inclusive. */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/** Returns a short, non-cryptographic unique id for wiring DOM elements (e.g. aria-describedby). Not for secrets — use crypto-backed generators for those. */
export function uniqueId(prefix = "id") {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Escapes text for safe insertion into HTML via innerHTML. */
export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Formats a byte count as a human-readable string (e.g. 1536 -> "1.5 KB"). */
export function formatBytes(bytes, decimals = 1) {
  if (!Number.isFinite(bytes) || bytes < 0) return "0 B";
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** exponent;
  return `${value.toFixed(exponent === 0 ? 0 : decimals)} ${units[exponent]}`;
}

/** True when the user's OS/browser has requested reduced motion. */
export function prefersReducedMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

/**
 * Runs `fn` on the next animation frame, coalescing repeated calls within
 * the same frame into one — useful for expensive input-driven re-renders.
 */
export function scheduleFrame(fn) {
  let scheduled = false;
  return function scheduledFn(...args) {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      fn.apply(this, args);
    });
  };
}

/** Pluralizes a word based on count: pluralize(1, "item") -> "1 item", pluralize(2, "item") -> "2 items". */
export function pluralize(count, singular, plural = `${singular}s`) {
  return `${count.toLocaleString()} ${count === 1 ? singular : plural}`;
}
