import { readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";

const REQUIRED_TOOL_FIELDS = ["id", "name", "slug", "category", "description"];
const REQUIRED_CATEGORY_FIELDS = ["id", "name", "slug", "description"];

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function listSubdirectories(dir) {
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

/**
 * Loads every categories/<slug>/category.json.
 * @param {string} rootDir
 * @returns {Array<object>}
 */
export function loadCategories(rootDir) {
  const categoriesDir = path.join(rootDir, "categories");
  const slugs = listSubdirectories(categoriesDir);

  return slugs.map((folderSlug) => {
    const manifestPath = path.join(categoriesDir, folderSlug, "category.json");
    if (!existsSync(manifestPath)) {
      throw new Error(`categories/${folderSlug}/ is missing category.json`);
    }
    const category = readJson(manifestPath);

    for (const field of REQUIRED_CATEGORY_FIELDS) {
      if (!category[field]) {
        throw new Error(`categories/${folderSlug}/category.json is missing required field "${field}"`);
      }
    }
    if (category.slug !== folderSlug) {
      throw new Error(
        `categories/${folderSlug}/category.json has slug "${category.slug}", which must match its folder name`
      );
    }

    return category;
  });
}

/**
 * Loads every tools/<slug>/tool.json + content.html, validating structure
 * and cross-references (category must exist; related tools are warned
 * about, not fatal, so linking a not-yet-built tool doesn't block a build).
 * @param {string} rootDir
 * @param {Array<object>} categories
 * @returns {Array<object>} tools, each with `.contentHtml` attached
 */
export function loadTools(rootDir, categories) {
  const toolsDir = path.join(rootDir, "tools");
  const categorySlugs = new Set(categories.map((category) => category.slug));
  const slugs = listSubdirectories(toolsDir);
  const seenIds = new Set();

  const tools = slugs.map((folderSlug) => {
    const toolDir = path.join(toolsDir, folderSlug);
    const manifestPath = path.join(toolDir, "tool.json");
    const contentPath = path.join(toolDir, "content.html");

    if (!existsSync(manifestPath)) {
      throw new Error(`tools/${folderSlug}/ is missing tool.json`);
    }
    if (!existsSync(contentPath)) {
      throw new Error(`tools/${folderSlug}/ is missing content.html`);
    }

    const tool = readJson(manifestPath);

    for (const field of REQUIRED_TOOL_FIELDS) {
      if (!tool[field]) {
        throw new Error(`tools/${folderSlug}/tool.json is missing required field "${field}"`);
      }
    }
    if (tool.slug !== folderSlug) {
      throw new Error(`tools/${folderSlug}/tool.json has slug "${tool.slug}", which must match its folder name`);
    }
    if (seenIds.has(tool.id)) {
      throw new Error(`Duplicate tool id "${tool.id}" (tools/${folderSlug}/tool.json)`);
    }
    seenIds.add(tool.id);
    if (!categorySlugs.has(tool.category)) {
      throw new Error(
        `tools/${folderSlug}/tool.json references unknown category "${tool.category}". ` +
          `Known categories: ${[...categorySlugs].join(", ")}`
      );
    }

    const cssPath = path.join(toolDir, "tool.css");
    const jsPath = path.join(toolDir, "tool.js");
    if (!existsSync(cssPath)) {
      throw new Error(`tools/${folderSlug}/ is missing tool.css — the tool page template always links it, so a missing file would 404.`);
    }
    if (!existsSync(jsPath)) {
      throw new Error(`tools/${folderSlug}/ is missing tool.js — the tool page template always loads it, so a missing file would 404.`);
    }

    return {
      ...tool,
      keywords: tool.keywords ?? [],
      faq: tool.faq ?? [],
      related: tool.related ?? [],
      version: tool.version ?? "1.0.0",
      updated: tool.updated ?? new Date().toISOString().slice(0, 10),
      icon: tool.icon ?? "🔧",
      difficulty: tool.difficulty ?? "beginner",
      priority: tool.priority ?? "normal",
      contentHtml: readFileSync(contentPath, "utf8"),
    };
  });

  // Validate related-tool references *after* all tools are loaded, since a
  // related slug might point to a tool later in the alphabetical listing.
  const allSlugs = new Set(tools.map((tool) => tool.slug));
  for (const tool of tools) {
    for (const relatedSlug of tool.related) {
      if (!allSlugs.has(relatedSlug)) {
        console.warn(
          `[build] Warning: tools/${tool.slug}/tool.json lists related tool "${relatedSlug}", which does not exist yet. Skipping that link.`
        );
      }
    }
  }

  return tools;
}

const REQUIRED_PAGE_FIELDS = ["title", "description"];

/**
 * Loads every pages/<slug>/page.json + content.html (About, Privacy, Terms,
 * Contact, …). These render at the site root (/<slug>/), not under /pages/.
 * @param {string} rootDir
 * @returns {Array<{slug:string,title:string,description:string,contentHtml:string}>}
 */
export function loadPages(rootDir) {
  const pagesDir = path.join(rootDir, "pages");
  if (!existsSync(pagesDir)) return [];
  const slugs = listSubdirectories(pagesDir);

  return slugs.map((slug) => {
    const pageDir = path.join(pagesDir, slug);
    const manifestPath = path.join(pageDir, "page.json");
    const contentPath = path.join(pageDir, "content.html");

    if (!existsSync(manifestPath)) throw new Error(`pages/${slug}/ is missing page.json`);
    if (!existsSync(contentPath)) throw new Error(`pages/${slug}/ is missing content.html`);

    const page = readJson(manifestPath);
    for (const field of REQUIRED_PAGE_FIELDS) {
      if (!page[field]) throw new Error(`pages/${slug}/page.json is missing required field "${field}"`);
    }

    return { slug, ...page, contentHtml: readFileSync(contentPath, "utf8") };
  });
}
