/**
 * Shared E2E test helpers. Reads the built site's own search index off
 * disk (public/assets/data/search-index.json) as the single source of
 * truth for "how many tools exist" and "what are their slugs" — tests
 * that hardcode a tool count as a magic number are exactly what broke
 * repeatedly during this project's 50-tool batch (see docs/ROADMAP.md's
 * Phase 3 section), since every new tool then requires updating the
 * number by hand somewhere no build step checks. Reading it from the
 * actual build output means these tests are correct by construction,
 * automatically, forever.
 */
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(path.dirname(path.dirname(fileURLToPath(import.meta.url))));

/** @returns {Array<{id:string,name:string,slug:string,category:string,description:string,keywords:string[]}>} */
export function readSearchIndex() {
  const indexPath = path.join(rootDir, "public/assets/data/search-index.json");
  return JSON.parse(readFileSync(indexPath, "utf8"));
}

/** @returns {Array<{slug:string,name:string}>} every category's slug + display name, read from categories/<slug>/category.json — the actual source of truth, not derived by guessing at a name-to-slug string transform. */
export function readCategories() {
  const categoriesDir = path.join(rootDir, "categories");
  return readdirSync(categoriesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const manifest = JSON.parse(readFileSync(path.join(categoriesDir, entry.name, "category.json"), "utf8"));
      return { slug: manifest.slug, name: manifest.name };
    })
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

/** @returns {string[]} every category slug. */
export function readCategorySlugs() {
  return readCategories().map((category) => category.slug);
}
