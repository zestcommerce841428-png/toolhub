/**
 * ToolHub static-site build.
 *
 * Reads hand-authored source (tools/, categories/, pages/, templates/,
 * components/, assets/) and produces the fully static, dependency-free
 * deploy artifact in public/. See docs/ARCHITECTURE.md for the rationale.
 *
 * This script has zero npm dependencies of its own — only Node's fs/path —
 * by design, so the build stays cheap to understand and maintain for the
 * lifetime of the project even if the ecosystem around it changes.
 *
 * Run via `npm run build` (which cleans public/, runs this, then compiles
 * Tailwind), or `npm run build:site` to run just this step.
 */
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

import { loadCategories, loadTools, loadPages } from "./lib/content.js";
import { renderTemplate, escapeHtml } from "./lib/template.js";
import { breadcrumbSchema, faqSchema, softwareApplicationSchema, renderJsonLd } from "./lib/schema.js";
import { writeFile, copyFile, copyDir, copyDirWithJsTransform } from "./lib/fs-helpers.js";
import { resolveSiteUrl } from "./lib/site-url.js";
import { minifyHtmlString, minifyJsString } from "./lib/minify.js";

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const publicDir = path.join(rootDir, "public");

const siteConfig = JSON.parse(readFileSync(path.join(rootDir, "site.config.json"), "utf8"));
const { siteName, tagline, twitterHandle, defaultOgImage } = siteConfig;

// siteUrl is resolved from the deployment platform's own environment
// variables at build time, not hardcoded — see scripts/lib/site-url.js for
// why that's the correct meaning of "auto-detected" for a static site
// (canonical tags, sitemap.xml, and JSON-LD are pre-rendered files with no
// server to inspect a request against).
const { url: siteUrl, source: siteUrlSource, isFallbackPlaceholder } = resolveSiteUrl(rootDir, siteConfig.siteUrl);
console.log(`[build] Site URL: ${siteUrl}  (source: ${siteUrlSource})`);
if (isFallbackPlaceholder) {
  console.warn(
    "[build] WARNING: no hosting platform detected (Vercel/Netlify/Cloudflare Pages/GitHub Pages) and no SITE_URL " +
      "env var is set, so canonical URLs, sitemap.xml, and JSON-LD are using site.config.json's fallback value. " +
      "Set SITE_URL explicitly, or deploy via a supported platform, before treating this build as production output."
  );
}

function absoluteUrl(urlPath) {
  return new URL(urlPath, siteUrl).toString();
}

// ---------------------------------------------------------------------------
// Load source content
// ---------------------------------------------------------------------------

const categories = loadCategories(rootDir);
const tools = loadTools(rootDir, categories).sort((a, b) => a.name.localeCompare(b.name));
const pages = loadPages(rootDir);

const categoryBySlug = new Map(categories.map((category) => [category.slug, category]));
const toolBySlug = new Map(tools.map((tool) => [tool.slug, tool]));

for (const tool of tools) {
  categoryBySlug.get(tool.category).toolCount = (categoryBySlug.get(tool.category).toolCount ?? 0) + 1;
}

// ---------------------------------------------------------------------------
// Load templates & partials
// ---------------------------------------------------------------------------

const templatesDir = path.join(rootDir, "templates");
const readTemplate = (name) => readFileSync(path.join(templatesDir, name), "utf8");

const toolTemplate = readTemplate("tool.template.html");
const categoryTemplate = readTemplate("category.template.html");
const homeTemplate = readTemplate("home.template.html");
const pageTemplate = readTemplate("page.template.html");
const themeBootstrapScript = readFileSync(path.join(templatesDir, "partials", "theme-bootstrap.js"), "utf8");
const faviconLinks = readFileSync(path.join(templatesDir, "partials", "favicon-links.html"), "utf8");

let headerPartial = readFileSync(path.join(templatesDir, "partials", "header.html"), "utf8");
let footerPartial = readFileSync(path.join(templatesDir, "partials", "footer.html"), "utf8");

// ---------------------------------------------------------------------------
// Render the header/footer chrome once — identical on every page.
// ---------------------------------------------------------------------------

const desktopCategoryLinks = categories
  .map(
    (category) =>
      `<li><a class="rounded-md px-3 py-2 text-sm font-medium text-text-muted hover:bg-surface hover:text-text" href="/categories/${category.slug}/">${escapeHtml(category.name)}</a></li>`
  )
  .join("\n");

const mobileCategoryLinks = categories
  .map(
    (category) =>
      `<li><a class="block rounded-md px-3 py-2 text-sm font-medium text-text-muted hover:bg-surface hover:text-text" href="/categories/${category.slug}/">${escapeHtml(category.name)}</a></li>`
  )
  .join("\n");

const footerCategoryLinks = categories
  .map(
    (category) =>
      `<li><a class="text-text-muted hover:text-text" href="/categories/${category.slug}/">${escapeHtml(category.name)}</a></li>`
  )
  .join("\n");

headerPartial = headerPartial
  .replace("{{CATEGORY_NAV_LINKS}}", desktopCategoryLinks)
  .replace("{{CATEGORY_NAV_LINKS_MOBILE}}", mobileCategoryLinks);
footerPartial = footerPartial.replace("{{FOOTER_CATEGORY_LINKS}}", footerCategoryLinks);

// ---------------------------------------------------------------------------
// Shared render helpers
// ---------------------------------------------------------------------------

function renderBreadcrumbHtml(items) {
  return items
    .map((item, index) => {
      const isLast = index === items.length - 1;
      const inner = isLast
        ? `<span aria-current="page" class="font-medium text-text">${escapeHtml(item.name)}</span>`
        : `<a class="hover:text-text" href="${item.path}">${escapeHtml(item.name)}</a>`;
      const separator = index > 0 ? `<span aria-hidden="true">/</span>` : "";
      return `${separator}<li class="flex items-center gap-1.5">${inner}</li>`;
    })
    .join("\n");
}

function renderToolCard(tool) {
  const category = categoryBySlug.get(tool.category);
  return `
    <a href="/tools/${tool.slug}/" class="tool-card">
      <span class="text-2xl" aria-hidden="true">${escapeHtml(tool.icon)}</span>
      <span class="text-base font-semibold text-text">${escapeHtml(tool.name)}</span>
      <span class="text-sm text-text-muted">${escapeHtml(tool.description)}</span>
      <span class="badge mt-auto self-start">${escapeHtml(category.name)}</span>
    </a>`;
}

function renderCategoryCard(category) {
  const count = category.toolCount ?? 0;
  return `
    <a href="/categories/${category.slug}/" class="tool-card">
      <span class="text-2xl" aria-hidden="true">${escapeHtml(category.icon ?? "🧰")}</span>
      <span class="text-base font-semibold text-text">${escapeHtml(category.name)}</span>
      <span class="text-sm text-text-muted">${escapeHtml(category.description)}</span>
      <span class="badge mt-auto self-start">${count} ${count === 1 ? "tool" : "tools"}</span>
    </a>`;
}

function renderFaqHtml(faq) {
  if (faq.length === 0) {
    return `<p class="text-sm text-text-muted">This tool doesn't have any FAQs yet.</p>`;
  }
  return faq
    .map(
      (entry, index) => `
      <details class="card group" ${index === 0 ? "open" : ""}>
        <summary class="cursor-pointer list-none text-sm font-semibold text-text marker:content-none">
          <span class="inline-block w-4 transition-transform duration-fast group-open:rotate-90" aria-hidden="true">&#9656;</span>
          ${escapeHtml(entry.question)}
        </summary>
        <p class="mt-2 pl-6 text-sm text-text-muted">${escapeHtml(entry.answer)}</p>
      </details>`
    )
    .join("\n");
}

/** Explicit related tools first, backfilled with same-category tools so the section is never empty. */
function resolveRelatedTools(tool, max = 3) {
  const explicit = tool.related.map((slug) => toolBySlug.get(slug)).filter(Boolean);
  const chosen = [...explicit];
  if (chosen.length < max) {
    const sameCategory = tools.filter(
      (candidate) => candidate.category === tool.category && candidate.slug !== tool.slug && !chosen.includes(candidate)
    );
    for (const candidate of sameCategory) {
      if (chosen.length >= max) break;
      chosen.push(candidate);
    }
  }
  return chosen.slice(0, max);
}

/**
 * Renders the whole "Related tools" section, or an empty string when
 * there's nothing to show (e.g. the only tool in a brand-new category) —
 * a heading with an empty grid under it reads as broken, not "coming
 * soon," so the section simply doesn't exist on the page in that case.
 */
function renderRelatedToolsSection(tool) {
  const related = resolveRelatedTools(tool);
  if (related.length === 0) return "";
  return `
      <section aria-labelledby="related-heading" class="mt-12">
        <h2 id="related-heading" class="mb-4 text-xl font-semibold text-text">Related tools</h2>
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          ${related.map(renderToolCard).join("\n")}
        </div>
      </section>`;
}

/** Minifies `html` and writes it — every generated page goes through here so none can accidentally ship unminified. */
async function writeMinifiedHtml(filePath, html, context) {
  writeFile(filePath, await minifyHtmlString(html, context));
}

/** Minifies a JS file (if it exists) and writes the result to `destPath`. */
async function copyMinifiedJs(sourcePath, destPath) {
  if (!existsSync(sourcePath)) return;
  const code = readFileSync(sourcePath, "utf8");
  writeFile(destPath, await minifyJsString(code, path.relative(rootDir, sourcePath)));
}

// ---------------------------------------------------------------------------
// Copy static assets
// ---------------------------------------------------------------------------

copyFile(path.join(rootDir, "assets/css/tokens.css"), path.join(publicDir, "assets/css/tokens.css"));
await copyDirWithJsTransform(path.join(rootDir, "assets/js"), path.join(publicDir, "assets/js"), minifyJsString);
copyDir(path.join(rootDir, "assets/icons"), path.join(publicDir, "assets/icons"));
copyDir(path.join(rootDir, "assets/images"), path.join(publicDir, "assets/images"));
copyDir(path.join(rootDir, "assets/fonts"), path.join(publicDir, "assets/fonts"));
copyDir(path.join(rootDir, "assets/animations"), path.join(publicDir, "assets/animations"));
copyFile(path.join(rootDir, "manifest.json"), path.join(publicDir, "manifest.json"));
await copyMinifiedJs(path.join(rootDir, "sw.js"), path.join(publicDir, "sw.js"));
copyFile(path.join(rootDir, "browserconfig.xml"), path.join(publicDir, "browserconfig.xml"));

// ---------------------------------------------------------------------------
// Render tool pages
// ---------------------------------------------------------------------------

for (const tool of tools) {
  const category = categoryBySlug.get(tool.category);
  const canonicalUrl = absoluteUrl(`/tools/${tool.slug}/`);
  const breadcrumbItems = [
    { name: "Home", path: "/" },
    { name: category.name, path: `/categories/${category.slug}/` },
    { name: tool.name, path: `/tools/${tool.slug}/` },
  ];

  const jsonLd = renderJsonLd(siteUrl, [
    breadcrumbSchema(breadcrumbItems.map((item) => ({ name: item.name, url: absoluteUrl(item.path) }))),
    softwareApplicationSchema(tool, canonicalUrl),
    faqSchema(tool.faq),
  ]);

  const html = renderTemplate(
    toolTemplate,
    {
      PAGE_TITLE: escapeHtml(`${tool.name} — Free Online Tool | ${siteName}`),
      META_DESCRIPTION: escapeHtml(tool.description),
      CANONICAL_URL: canonicalUrl,
      OG_TITLE: escapeHtml(tool.name),
      OG_IMAGE: absoluteUrl(defaultOgImage),
      SITE_NAME: escapeHtml(siteName),
      TWITTER_HANDLE: escapeHtml(twitterHandle),
      THEME_BOOTSTRAP_SCRIPT: themeBootstrapScript,
      FAVICON_LINKS: faviconLinks,
      HEADER: headerPartial,
      FOOTER: footerPartial,
      JSON_LD: jsonLd,
      BREADCRUMB_HTML: renderBreadcrumbHtml(breadcrumbItems),
      CATEGORY_NAME: escapeHtml(category.name),
      TOOL_NAME: escapeHtml(tool.name),
      TOOL_DESCRIPTION: escapeHtml(tool.description),
      CONTENT: tool.contentHtml,
      FAQ_HTML: renderFaqHtml(tool.faq),
      RELATED_TOOLS_SECTION: renderRelatedToolsSection(tool),
    },
    `tools/${tool.slug}`
  );

  await writeMinifiedHtml(path.join(publicDir, "tools", tool.slug, "index.html"), html, `tools/${tool.slug}`);
  copyFile(path.join(rootDir, "tools", tool.slug, "tool.css"), path.join(publicDir, "tools", tool.slug, "tool.css"));
  await copyMinifiedJs(path.join(rootDir, "tools", tool.slug, "tool.js"), path.join(publicDir, "tools", tool.slug, "tool.js"));
  // logic.js is optional: only tools with non-trivial, unit-tested pure
  // logic split it out of tool.js (see docs/CONTRIBUTING.md). copyMinifiedJs
  // is a silent no-op when the source file doesn't exist.
  await copyMinifiedJs(path.join(rootDir, "tools", tool.slug, "logic.js"), path.join(publicDir, "tools", tool.slug, "logic.js"));
}

// ---------------------------------------------------------------------------
// Render category pages + the /categories/ index
// ---------------------------------------------------------------------------

for (const category of categories) {
  const canonicalUrl = absoluteUrl(`/categories/${category.slug}/`);
  const toolsInCategory = tools.filter((tool) => tool.category === category.slug);
  const breadcrumbItems = [
    { name: "Home", path: "/" },
    { name: category.name, path: `/categories/${category.slug}/` },
  ];

  const jsonLd = renderJsonLd(siteUrl, [
    breadcrumbSchema(breadcrumbItems.map((item) => ({ name: item.name, url: absoluteUrl(item.path) }))),
  ]);

  const html = renderTemplate(
    categoryTemplate,
    {
      PAGE_TITLE: escapeHtml(`${category.name} Tools | ${siteName}`),
      META_DESCRIPTION: escapeHtml(category.description),
      CANONICAL_URL: canonicalUrl,
      OG_TITLE: escapeHtml(`${category.name} Tools`),
      OG_IMAGE: absoluteUrl(defaultOgImage),
      SITE_NAME: escapeHtml(siteName),
      TWITTER_HANDLE: escapeHtml(twitterHandle),
      THEME_BOOTSTRAP_SCRIPT: themeBootstrapScript,
      FAVICON_LINKS: faviconLinks,
      HEADER: headerPartial,
      FOOTER: footerPartial,
      JSON_LD: jsonLd,
      BREADCRUMB_HTML: renderBreadcrumbHtml(breadcrumbItems),
      CATEGORY_NAME: escapeHtml(category.name),
      CATEGORY_DESCRIPTION: escapeHtml(category.description),
      TOOL_COUNT: `${toolsInCategory.length} ${toolsInCategory.length === 1 ? "tool" : "tools"}`,
      TOOL_CARDS_HTML:
        toolsInCategory.length > 0
          ? toolsInCategory.map(renderToolCard).join("\n")
          : `<p class="text-sm text-text-muted">No tools in this category yet — check back soon.</p>`,
    },
    `categories/${category.slug}`
  );

  await writeMinifiedHtml(path.join(publicDir, "categories", category.slug, "index.html"), html, `categories/${category.slug}`);
}

{
  const canonicalUrl = absoluteUrl("/categories/");
  const breadcrumbItems = [
    { name: "Home", path: "/" },
    { name: "All categories", path: "/categories/" },
  ];
  const jsonLd = renderJsonLd(siteUrl, [
    breadcrumbSchema(breadcrumbItems.map((item) => ({ name: item.name, url: absoluteUrl(item.path) }))),
  ]);
  const content = `
    <h1 class="text-3xl font-bold tracking-tight text-text sm:text-4xl">All categories</h1>
    <p class="mt-2 max-w-2xl text-text-muted">Every tool on ToolHub, grouped by what it's for.</p>
    <div class="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      ${categories.map(renderCategoryCard).join("\n")}
    </div>`;

  const html = renderTemplate(
    pageTemplate,
    {
      PAGE_TITLE: escapeHtml(`All categories | ${siteName}`),
      META_DESCRIPTION: "Browse every ToolHub category — text, developer, security, color, and calculator tools that run entirely in your browser.",
      CANONICAL_URL: canonicalUrl,
      OG_TITLE: "All categories",
      OG_IMAGE: absoluteUrl(defaultOgImage),
      SITE_NAME: escapeHtml(siteName),
      TWITTER_HANDLE: escapeHtml(twitterHandle),
      THEME_BOOTSTRAP_SCRIPT: themeBootstrapScript,
      FAVICON_LINKS: faviconLinks,
      HEADER: headerPartial,
      FOOTER: footerPartial,
      JSON_LD: jsonLd,
      BREADCRUMB_HTML: renderBreadcrumbHtml(breadcrumbItems),
      CONTENT: content,
    },
    "categories/index"
  );

  await writeMinifiedHtml(path.join(publicDir, "categories", "index.html"), html, "categories/index");
}

// ---------------------------------------------------------------------------
// Render static pages (about, privacy, terms, contact, …) at site root
// ---------------------------------------------------------------------------

for (const page of pages) {
  const canonicalUrl = absoluteUrl(`/${page.slug}/`);
  const breadcrumbItems = [
    { name: "Home", path: "/" },
    { name: page.title, path: `/${page.slug}/` },
  ];
  const jsonLd = renderJsonLd(siteUrl, [
    breadcrumbSchema(breadcrumbItems.map((item) => ({ name: item.name, url: absoluteUrl(item.path) }))),
  ]);

  const html = renderTemplate(
    pageTemplate,
    {
      PAGE_TITLE: escapeHtml(`${page.title} | ${siteName}`),
      META_DESCRIPTION: escapeHtml(page.description),
      CANONICAL_URL: canonicalUrl,
      OG_TITLE: escapeHtml(page.title),
      OG_IMAGE: absoluteUrl(defaultOgImage),
      SITE_NAME: escapeHtml(siteName),
      TWITTER_HANDLE: escapeHtml(twitterHandle),
      THEME_BOOTSTRAP_SCRIPT: themeBootstrapScript,
      FAVICON_LINKS: faviconLinks,
      HEADER: headerPartial,
      FOOTER: footerPartial,
      JSON_LD: jsonLd,
      BREADCRUMB_HTML: renderBreadcrumbHtml(breadcrumbItems),
      CONTENT: page.contentHtml,
    },
    `pages/${page.slug}`
  );

  await writeMinifiedHtml(path.join(publicDir, page.slug, "index.html"), html, `pages/${page.slug}`);
}

// ---------------------------------------------------------------------------
// Homepage
// ---------------------------------------------------------------------------

{
  const featured = tools.filter((tool) => tool.priority === "high").slice(0, 6);
  const featuredTools = featured.length > 0 ? featured : tools.slice(0, 6);

  const jsonLd = renderJsonLd(siteUrl, [
    { "@type": "WebSite", name: siteName, url: siteUrl },
    {
      "@type": "Organization",
      name: siteName,
      url: siteUrl,
    },
  ]);

  const html = renderTemplate(
    homeTemplate,
    {
      PAGE_TITLE: escapeHtml(`${siteName} — ${tagline}`),
      META_DESCRIPTION: escapeHtml(tagline),
      CANONICAL_URL: absoluteUrl("/"),
      OG_TITLE: escapeHtml(siteName),
      OG_IMAGE: absoluteUrl(defaultOgImage),
      SITE_NAME: escapeHtml(siteName),
      TWITTER_HANDLE: escapeHtml(twitterHandle),
      THEME_BOOTSTRAP_SCRIPT: themeBootstrapScript,
      FAVICON_LINKS: faviconLinks,
      HEADER: headerPartial,
      FOOTER: footerPartial,
      JSON_LD: jsonLd,
      TAGLINE: escapeHtml(tagline),
      TOOL_TOTAL: String(tools.length),
      CATEGORY_CARDS_HTML: categories.map(renderCategoryCard).join("\n"),
      FEATURED_TOOL_CARDS_HTML: featuredTools.map(renderToolCard).join("\n"),
    },
    "home"
  );

  await writeMinifiedHtml(path.join(publicDir, "index.html"), html, "home");
}

// ---------------------------------------------------------------------------
// Search index
// ---------------------------------------------------------------------------

const searchIndex = tools.map((tool) => ({
  id: tool.id,
  name: tool.name,
  slug: tool.slug,
  category: categoryBySlug.get(tool.category).name,
  description: tool.description,
  keywords: tool.keywords,
}));
writeFile(path.join(publicDir, "assets/data/search-index.json"), JSON.stringify(searchIndex));

// ---------------------------------------------------------------------------
// sitemap.xml + robots.txt
// ---------------------------------------------------------------------------

const staticUrls = ["/", "/categories/", ...pages.map((page) => `/${page.slug}/`)];
const categoryUrls = categories.map((category) => `/categories/${category.slug}/`);
const toolUrls = tools.map((tool) => `/tools/${tool.slug}/`);
const allUrls = [...staticUrls, ...categoryUrls, ...toolUrls];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map((urlPath) => `  <url><loc>${absoluteUrl(urlPath)}</loc></url>`).join("\n")}
</urlset>
`;
writeFile(path.join(publicDir, "sitemap.xml"), sitemap);

const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${absoluteUrl("/sitemap.xml")}
`;
writeFile(path.join(publicDir, "robots.txt"), robotsTxt);

// ---------------------------------------------------------------------------
// Offline fallback page (served by sw.js when a navigation fails offline
// and nothing better is cached). Deliberately not run through the page
// template — it must render with zero dependencies on network state.
// ---------------------------------------------------------------------------

const offlineHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>You're offline | ${escapeHtml(siteName)}</title>
  <meta name="robots" content="noindex" />
  <link rel="stylesheet" href="/assets/css/tokens.css" />
  <link rel="stylesheet" href="/assets/css/main.css" />
</head>
<body class="flex min-h-screen items-center justify-center bg-bg px-4 text-center text-text">
  <div>
    <p class="text-5xl" aria-hidden="true">📡</p>
    <h1 class="mt-4 text-2xl font-bold">You're offline</h1>
    <p class="mt-2 max-w-sm text-text-muted">This page hasn't been loaded before, so it isn't available offline yet. Tools you've already opened will keep working.</p>
    <a href="/" class="btn-primary mt-6 inline-flex">Go to homepage</a>
  </div>
</body>
</html>
`;
await writeMinifiedHtml(path.join(publicDir, "offline.html"), offlineHtml, "offline");

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

console.log(`[build] ${categories.length} categories, ${tools.length} tools, ${pages.length} static pages, ${allUrls.length} URLs.`);
console.log(`[build] Wrote site to ${path.relative(rootDir, publicDir)}/`);

if (!existsSync(path.join(publicDir, "assets/css/main.css"))) {
  console.log(`[build] Note: public/assets/css/main.css not found yet — run "npm run build:css" (or "npm run build") to compile Tailwind.`);
}
