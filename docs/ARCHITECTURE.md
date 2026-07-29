# ToolHub — Architecture

## Mission

A 100% client-side, zero-backend catalog of browser-based utilities, architected
to scale toward 1,500+ tools and remain maintainable for a decade. No accounts,
no tracking, no server round-trips for tool logic — everything a tool does, it
does in the visitor's browser.

## Runtime vs. build-time — the key architectural decision

The source spec asks for "zero backend" **and** "Tailwind CSS" **and** a folder
that separates `tools/`, `categories/`, `templates/`, `components/` from a
`public/` directory. Taken together, that only makes sense as a **static site
generator (SSG) pattern**:

- **Source of truth** (hand-authored, never shipped as-is): `tools/*/tool.json`
  + `tools/*/content.html`, `categories/*/category.json`, `templates/`,
  `components/`, `assets/css/tokens.css`, `assets/js/`.
- **Build step** (`npm run build`, Node-only, no framework): reads the source,
  stitches each tool/category/page into its full HTML document (shared header,
  footer, nav, JSON-LD, meta tags), compiles Tailwind, generates the search
  index, sitemap, and robots.txt.
- **Deploy artifact**: `public/`. This is what actually gets served. It is
  plain HTML/CSS/JS — no Node, no framework, no build step at request time.
  It can be hosted on literally any static host (or opened from disk) forever,
  even if the build tooling around it goes stale.

This satisfies "zero backend" in the only sense that matters for a browser
tool site — **nothing executes server-side when a visitor loads a page** — while
avoiding the alternative of hand-duplicating header/footer/schema markup
across 1,500 HTML files, which would fail "maintainability," "no duplicate
logic," and "10-year lifespan" far worse than a 40-line Node build script
would.

The build script (`scripts/build.js`) uses **zero npm dependencies of its
own** — just Node's `fs`/`path`. The only devDependency in the whole project
is `tailwindcss`, used strictly as a CSS compiler at build time. If Tailwind
is ever abandoned upstream, the hand-authored `tokens.css` (plain CSS custom
properties) still works standalone — Tailwind utility classes are a
convenience layer on top of the token system, not a replacement for it.

## Why not React/Vue/Svelte/Next — confirmed, not reconsidered

The spec is right to exclude frameworks here. A tool like a word counter or a
JSON formatter is a form with an output panel; a virtual DOM and hydration
pipeline is pure overhead for that shape of problem, and it would force a
build/runtime dependency chain the "10-year lifespan" goal actively works
against. Vanilla ES modules plus small, focused shared utilities is the right
weight class.

## Directory layout

```
toolhub/
├── assets/
│   ├── css/           tokens.css (design tokens), app.css (Tailwind entry)
│   ├── js/core/        shared, dependency-free ES modules
│   ├── icons/, images/, fonts/, animations/, data/
├── components/         hand-authored HTML partials + the few real Web Components
├── templates/          page shells (tool / category / home) with {{placeholders}}
│   └── partials/       header.html, footer.html, nav.html
├── tools/<slug>/        tool.json + content.html (source, per tool)
├── categories/<slug>/   category.json (source, per category)
├── pages/<slug>/         static pages (about, privacy, terms, contact)
├── scripts/             build.js and friends (Node, zero deps)
├── tests/unit/          node:test unit tests for pure logic
├── docs/                this file, CONTRIBUTING.md, ROADMAP.md, QA_CHECKLIST.md
└── public/              GENERATED. This is the deploy artifact. Never hand-edit.
```

## Per-tool contract

Every tool is defined by exactly two source files:

- `tools/<slug>/tool.json` — machine-readable metadata (id, name, slug,
  category, description, keywords, difficulty, version, updated, icon,
  related tool slugs, FAQ entries). This single file drives the tool's SEO
  meta tags, JSON-LD (`SoftwareApplication`, `FAQPage`, `BreadcrumbList`),
  its search-index entry, its category-page listing, and its "Related Tools"
  block — so a tool's discoverability is never hand-wired in more than one
  place.
- `tools/<slug>/content.html` — the tool's unique body markup (heading,
  input/output panels, settings, examples). The build script wraps this in
  the shared tool layout (header, breadcrumb, footer, related tools, FAQ
  accordion built from `tool.json`).
- `tools/<slug>/tool.js` and `tools/<slug>/tool.css` — the tool's logic and
  tool-specific styling. `tool.js` is an ES module that imports only from
  `assets/js/core/*` and the browser platform — never from another tool.

This means adding tool #9 through #1,500 is a mechanical, reviewable diff:
one JSON file, one HTML fragment, one JS module, optionally one CSS file. No
step requires touching shared code, which is what makes 1,500 of these
tractable for one team over ten years.

## Design tokens

All spacing, color, radius, shadow, and animation values live once, in
`assets/css/tokens.css`, as CSS custom properties on an 8px base grid
(`--space-1: 0.5rem` … ), exposed in both a light and dark palette selected
via `[data-theme]` on `<html>`, defaulting to `prefers-color-scheme`. Tailwind
config reads these same variables (`theme.extend.colors.primary: 'var(--color-primary)'`)
so utility classes and hand-written component CSS never drift out of sync.

## Shared JS modules (`assets/js/core/`)

Each module is a small ES module, no globals, no side effects on import
(except `theme.js`, which must run pre-paint to avoid a flash of wrong theme).
Phase 1 ships: `clipboard.js`, `download.js`, `storage.js`, `validator.js`,
`toast.js`, `theme.js`, `search.js`, `keyboard.js`, `utility.js`. Modules not
yet needed by a shipped tool (`modal.js`, `router.js`, `favorites.js`,
`history.js`, `color.js`, `date.js`, `math.js`, `csv.js`, `json.js`, …) are
intentionally **not stubbed out** — an empty or fake module is worse than no
module, since it would silently pass review while doing nothing. They are
tracked in `ROADMAP.md` and get created in the phase where a real tool first
needs them.

## Search

`scripts/build.js` aggregates every `tool.json` into
`public/assets/data/search-index.json` at build time. `search.js` fetches
that once, then does in-memory scoring (name match > keyword match >
description match) — no server, no third-party search service, fast enough
client-side at 1,500 entries (~200KB of JSON) without pagination tricks.

## Accessibility & SEO, enforced structurally, not by discipline alone

Rather than relying on every future tool author to remember WCAG and schema
requirements, the shared `templates/tool.template.html` already contains: the
skip-link, the landmark regions (`header`/`nav`/`main`/`footer`), the
breadcrumb with `BreadcrumbList` JSON-LD, the FAQ accordion with `FAQPage`
JSON-LD generated from `tool.json.faq`, canonical/OG/Twitter meta generated
from `tool.json`, and a visible focus style from `tokens.css`. A tool author
supplies content; they cannot easily omit the structural requirements because
they never write that scaffolding by hand.

## What Phase 1 actually ships

Given the target of 1,500+ tools is a multi-year effort, this initial build
delivers the **full pipeline, working end-to-end**, plus a representative
tool in each of five shapes (text transform, code formatting, generator with
options, bidirectional converter, numeric calculator), across five
categories — proof that the architecture holds, not a placeholder. See
`ROADMAP.md` for what is deliberately deferred and why.
