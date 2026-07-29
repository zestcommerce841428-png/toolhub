/**
 * Client-side search over the build-generated tool index
 * (public/assets/data/search-index.json — see scripts/build.js). No server,
 * no third-party search service: at a target scale of ~1,500 tools the
 * index is small enough (well under 1MB) to fetch once and score in memory.
 */

import { debounce, escapeHtml } from "./utility.js";

let indexPromise;

/**
 * Fetches and caches the search index for the lifetime of the page.
 * @param {string} [url]
 * @returns {Promise<Array<{id:string,name:string,slug:string,category:string,description:string,keywords:string[]}>>}
 */
export function loadSearchIndex(url = "/assets/data/search-index.json") {
  if (!indexPromise) {
    indexPromise = fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error(`Search index request failed: ${response.status}`);
        return response.json();
      })
      .catch((error) => {
        indexPromise = undefined; // allow retry on next call
        throw error;
      });
  }
  return indexPromise;
}

/**
 * Scores and ranks tools against a query. Name-prefix matches rank highest,
 * then name-substring, then keyword, then description — so "json" surfaces
 * "JSON Formatter" above a tool that merely mentions JSON in its blurb.
 * @param {Array} tools
 * @param {string} query
 * @param {number} [limit]
 */
export function scoreTools(tools, query, limit = 8) {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];

  const scored = [];
  for (const tool of tools) {
    const name = tool.name.toLowerCase();
    let score = 0;

    if (name === needle) score = 100;
    else if (name.startsWith(needle)) score = 80;
    else if (name.includes(needle)) score = 60;
    else if (tool.keywords?.some((keyword) => keyword.toLowerCase().includes(needle))) score = 40;
    else if (tool.description.toLowerCase().includes(needle)) score = 20;

    if (score > 0) scored.push({ ...tool, score });
  }

  scored.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
  return scored.slice(0, limit);
}

/**
 * Wires an <input> + results container into an accessible combobox:
 * ARIA combobox/listbox roles, debounced fetch-backed scoring, and
 * Up/Down/Enter/Escape keyboard navigation.
 * @param {{
 *   inputEl: HTMLInputElement,
 *   resultsEl: HTMLElement,
 *   onNavigate?: (tool: object) => void,
 *   indexUrl?: string,
 * }} config
 */
export function initSearch({ inputEl, resultsEl, onNavigate, indexUrl }) {
  resultsEl.setAttribute("role", "listbox");
  inputEl.setAttribute("role", "combobox");
  inputEl.setAttribute("aria-expanded", "false");
  inputEl.setAttribute("aria-autocomplete", "list");
  inputEl.setAttribute("aria-controls", resultsEl.id);

  let currentResults = [];
  let activeIndex = -1;

  function render(results) {
    currentResults = results;
    activeIndex = results.length > 0 ? 0 : -1;
    inputEl.setAttribute("aria-expanded", String(results.length > 0));

    if (results.length === 0) {
      resultsEl.innerHTML = "";
      resultsEl.hidden = true;
      inputEl.removeAttribute("aria-activedescendant");
      return;
    }

    resultsEl.hidden = false;
    resultsEl.innerHTML = results
      .map(
        (tool, index) => `
          <li role="option" id="search-option-${index}" aria-selected="${index === activeIndex}"
              data-slug="${escapeHtml(tool.slug)}"
              class="cursor-pointer rounded-md px-3 py-2 text-sm ${
                index === activeIndex ? "bg-primary text-primary-fg" : "text-text hover:bg-surface"
              }">
            <span class="font-medium">${escapeHtml(tool.name)}</span>
            <span class="ml-2 ${index === activeIndex ? "opacity-80" : "text-text-muted"}">${escapeHtml(tool.category)}</span>
          </li>`
      )
      .join("");
    syncActiveDescendant();
  }

  function syncActiveDescendant() {
    if (activeIndex < 0) {
      inputEl.removeAttribute("aria-activedescendant");
      return;
    }
    inputEl.setAttribute("aria-activedescendant", `search-option-${activeIndex}`);
    [...resultsEl.children].forEach((child, index) => {
      child.setAttribute("aria-selected", String(index === activeIndex));
      child.classList.toggle("bg-primary", index === activeIndex);
      child.classList.toggle("text-primary-fg", index === activeIndex);
      child.classList.toggle("text-text", index !== activeIndex);
      child.classList.toggle("hover:bg-surface", index !== activeIndex);
    });
  }

  function navigateToActive() {
    if (activeIndex < 0 || !currentResults[activeIndex]) return;
    onNavigate?.(currentResults[activeIndex]);
  }

  const runSearch = debounce(async (query) => {
    if (!query.trim()) {
      render([]);
      return;
    }
    try {
      const tools = await loadSearchIndex(indexUrl);
      render(scoreTools(tools, query));
    } catch {
      render([]);
    }
  }, 120);

  inputEl.addEventListener("input", () => runSearch(inputEl.value));

  inputEl.addEventListener("keydown", (event) => {
    if (currentResults.length === 0) return;
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        activeIndex = (activeIndex + 1) % currentResults.length;
        syncActiveDescendant();
        break;
      case "ArrowUp":
        event.preventDefault();
        activeIndex = (activeIndex - 1 + currentResults.length) % currentResults.length;
        syncActiveDescendant();
        break;
      case "Enter":
        event.preventDefault();
        navigateToActive();
        break;
      case "Escape":
        render([]);
        break;
      default:
        break;
    }
  });

  resultsEl.addEventListener("click", (event) => {
    const item = event.target.closest("[data-slug]");
    if (!item) return;
    const index = [...resultsEl.children].indexOf(item);
    if (index >= 0) {
      activeIndex = index;
      navigateToActive();
    }
  });

  return {
    clear: () => {
      inputEl.value = "";
      render([]);
    },
  };
}
