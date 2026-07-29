/**
 * ToolHub service worker.
 *
 * Strategy, deliberately different per resource type because a 1,500-tool
 * site can't sanely precache everything:
 *  - App shell (a handful of always-needed assets): precached on install.
 *  - Static assets (/assets/**): cache-first, refreshed in the background
 *    (stale-while-revalidate) — they're versioned by CACHE_NAME, so a stale
 *    hit is only ever stale until the next deploy bumps the version.
 *  - HTML documents (tool/category/page navigations): network-first with a
 *    short timeout, falling back to a previously-cached copy, and finally
 *    to /offline.html — so a tool you've already opened once keeps working
 *    offline, without pre-downloading all 1,500 pages up front.
 *
 * Bump CACHE_NAME on any deploy that changes cached file contents; the
 * activate handler deletes every cache that doesn't match the new name.
 */

const CACHE_NAME = "toolhub-v1";
const NETWORK_TIMEOUT_MS = 3500;

const APP_SHELL_URLS = [
  "/",
  "/offline.html",
  "/assets/css/tokens.css",
  "/assets/css/main.css",
  "/assets/js/app.js",
  "/assets/js/core/theme.js",
  "/assets/js/core/storage.js",
  "/assets/js/core/search.js",
  "/assets/js/core/keyboard.js",
  "/assets/js/core/utility.js",
  "/assets/data/search-index.json",
  "/assets/icons/favicon.svg",
  "/manifest.json",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("network-timeout")), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}

async function handleNavigationRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await withTimeout(fetch(request), NETWORK_TIMEOUT_MS);
    cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(request);
    return cached ?? (await cache.match("/offline.html"));
  }
}

async function handleStaticAssetRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  const networkFetch = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => undefined);
  return cached ?? (await networkFetch) ?? Response.error();
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  if (url.pathname.startsWith("/assets/")) {
    event.respondWith(handleStaticAssetRequest(request));
  }
});
