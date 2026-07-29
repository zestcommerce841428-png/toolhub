/**
 * Safe localStorage wrapper. localStorage can throw in private-browsing
 * modes, when the user has disabled storage, or when the quota is
 * exceeded — every call here is guarded so a storage failure degrades to
 * "preference not remembered" rather than a crashed tool.
 *
 * All keys are namespaced under "toolhub:" so this site never collides
 * with anything else that might share the origin.
 */

const NAMESPACE = "toolhub:";

let cachedAvailable;

/** Feature-detects localStorage once and caches the result. */
export function isStorageAvailable() {
  if (cachedAvailable !== undefined) return cachedAvailable;
  try {
    const testKey = `${NAMESPACE}__probe__`;
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    cachedAvailable = true;
  } catch {
    cachedAvailable = false;
  }
  return cachedAvailable;
}

/**
 * Reads and JSON-parses a namespaced key. Returns `fallback` if the key is
 * missing, storage is unavailable, or the stored value fails to parse.
 * @template T
 * @param {string} key
 * @param {T} fallback
 * @returns {T}
 */
export function getItem(key, fallback = null) {
  if (!isStorageAvailable()) return fallback;
  try {
    const raw = window.localStorage.getItem(NAMESPACE + key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

/**
 * JSON-serializes and stores `value` under a namespaced key.
 * @param {string} key
 * @param {unknown} value
 * @returns {boolean} true on success.
 */
export function setItem(key, value) {
  if (!isStorageAvailable()) return false;
  try {
    window.localStorage.setItem(NAMESPACE + key, JSON.stringify(value));
    return true;
  } catch {
    // Most likely QuotaExceededError — nothing actionable for the caller
    // beyond knowing the write didn't happen.
    return false;
  }
}

/** Removes a namespaced key. */
export function removeItem(key) {
  if (!isStorageAvailable()) return;
  try {
    window.localStorage.removeItem(NAMESPACE + key);
  } catch {
    // Ignore — nothing to clean up if storage isn't writable.
  }
}

/**
 * Subscribes to changes of a namespaced key made in *other* tabs/windows
 * (the native "storage" event never fires in the tab that made the write).
 * @param {string} key
 * @param {(newValue: unknown) => void} callback
 * @returns {() => void} unsubscribe function
 */
export function onExternalChange(key, callback) {
  const fullKey = NAMESPACE + key;
  function handleStorageEvent(event) {
    if (event.key !== fullKey) return;
    try {
      callback(event.newValue === null ? null : JSON.parse(event.newValue));
    } catch {
      callback(null);
    }
  }
  window.addEventListener("storage", handleStorageEvent);
  return () => window.removeEventListener("storage", handleStorageEvent);
}
