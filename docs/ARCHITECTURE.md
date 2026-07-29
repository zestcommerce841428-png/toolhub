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

The "Related Tools" section backfills from other tools in the same category
when a tool's own `related` list is short or empty — but when a category
has only one tool (true for four of the five categories as of this
writing), there's nothing to backfill with. `renderRelatedToolsSection` in
`scripts/build.js` omits the entire section, not just the cards, in that
case: a heading over an empty grid reads as a broken page, not an early
one. It reappears automatically once a category's second tool ships.

## Design tokens

All spacing, color, radius, shadow, and animation values live once, in
`assets/css/tokens.css`, as CSS custom properties on an 8px base grid
(`--space-1: 0.5rem` … ), exposed in both a light and dark palette selected
via `[data-theme]` on `<html>`, defaulting to `prefers-color-scheme`. Tailwind
config reads the *color* variables (`theme.extend.colors.primary: 'var(--color-primary)'`)
so color utility classes and hand-written component CSS never drift out of
sync.

**Every semantic color that ever needs an opacity modifier** (`bg-primary/10`,
`border-danger/40`, the tinted icon badge behind every tool/category card,
toast variants, status badges) is stored **twice** in `tokens.css`: once as
the familiar hex string (`--color-primary: #2563eb`, used directly wherever
plain CSS reads it — `color: var(--color-primary)` in `app.css`'s base
layer) and once as space-separated R/G/B channels with a `-rgb` suffix
(`--color-primary-rgb: 37 99 235`). `tailwind.config.js` points its color
keys at the `-rgb` form, wrapped as `rgb(var(--color-primary-rgb) /
<alpha-value>)` — Tailwind's documented pattern for opacity-modifiable
CSS-variable colors. This isn't optional plumbing: a CSS custom property
holding an opaque hex string can't have an alpha channel blended into it at
build time, so `bg-primary/10` against a plain `var(--color-primary)`
**silently compiles to nothing at all** rather than erroring — this had
been quietly breaking every opacity-modified color in the project (the
tool-card icon tint, BMI status badges, toast borders) since the tokens
were first written. Colors that never need opacity (`bg`, `surface`,
`border`, `text-*`) keep only the plain hex form. If you add a new
semantic color, add both forms and decide which category it's in.

**Every custom class used only inside `scripts/build.js`'s
template-rendering functions must have its class name string appear
somewhere `tailwind.config.js`'s `content` glob actually scans** —
`scripts/**/*.js` is in that list for exactly this reason. Tailwind's JIT
purges any class it never sees referenced in a scanned file, including
your own hand-written `@layer components` rules; `.tool-card` and its
children (`renderToolCard`/`renderCategoryCard` in `scripts/build.js`)
were being silently dropped from the compiled CSS from the very first
build — the class names only ever existed as string literals in a file
outside the scanned globs, so every "card" on the site was 100% unstyled
text with an emoji in front of it until this was caught by a direct user
report that the cards didn't look professional. Worth internalizing: a
missing/purged custom class doesn't error, it just silently produces
nothing — screenshots are what catch this, not the build log.

Spacing is the one token category `tailwind.config.js` deliberately does
**not** remap. An earlier version aliased `theme.extend.spacing["8"]` etc. to
`--space-8`, but `tokens.css`'s spacing scale uses an "N × 8px" naming
convention (`--space-8` = 64px) that collides with Tailwind's own numeric
scale, where `8` already means `8 × 0.25rem` (32px) — the meaning every
`gap-4`/`px-4`/`w-8`/etc. across every template and tool assumes. Aliasing
them silently doubled a large fraction of the site's spacing. Found via a
Playwright viewport sweep that traced a header overflow back to this file;
see `tailwind.config.js`'s comment for the full explanation. The `--space-N`
custom properties remain valid as a standalone reference scale for
hand-written CSS — they just don't drive Tailwind's utilities.

## Site URL resolution — "auto-detected," precisely defined

Canonical `<link>` tags, `sitemap.xml`, `robots.txt`, and every JSON-LD
`url`/`@id` are pre-rendered into static files at build time (that's the
whole point of the architecture above), so there is no request happening
that a real URL could be detected *from* — a static file can't inspect a
`Host` header. "Auto-detected" therefore means: pulled automatically from
whichever hosting platform is running the build, not hardcoded in a
committed config file. `scripts/lib/site-url.js` resolves it in order —
`SITE_URL` env var (explicit override) → Vercel → Netlify → Cloudflare
Pages → GitHub Pages (via `GITHUB_REPOSITORY`, or a committed `CNAME` for a
custom domain) → `site.config.json`'s `siteUrl` as a last resort, logged
as a warning since that's normally only hit on a local build with none of
the above env vars present. `npm run build` prints which source it used.

## Shared JS modules (`assets/js/core/`)

Each module is a small ES module, no globals, no side effects on import
(except `theme.js`, which must run pre-paint to avoid a flash of wrong theme).
Shipped so far: `clipboard.js`, `download.js`, `storage.js`, `validator.js`,
`toast.js`, `theme.js`, `search.js`, `keyboard.js`, `utility.js`, and
`random.js` (secure random primitives — `secureRandomInt`, `secureShuffle`,
`secureChoice` — extracted from `password-generator/logic.js` once a
second tool, `uuid-generator`, needed the same capability; a third and
fourth, `random-number-generator` and `sku-generator`, now use it too).
Modules not yet needed by a shipped tool (`modal.js`, `router.js`,
`favorites.js`, `history.js`, `color.js`, `date.js`, `math.js`, `csv.js`,
`json.js`, …) are intentionally **not stubbed out** — an empty or fake
module is worse than no module, since it would silently pass review while
doing nothing. They are tracked in `ROADMAP.md` and get created in the
phase where a real tool first needs them.

**Gotcha for anyone adding a `logic.js` that needs a core module**:
`tool.js` files import core modules by absolute path (`/assets/js/core/
random.js`), which only resolves correctly in a browser (relative to the
site root). `logic.js` files are also imported directly by
`tests/unit/*.test.js` under plain Node, where a leading `/` resolves as a
*filesystem*-absolute path instead and breaks — so any `logic.js` that
needs a core module must import it with a relative path
(`../../assets/js/core/random.js`), never the absolute form. Verified this
still resolves correctly once copied into `public/tools/<slug>/logic.js`,
since `assets/js/core/` and `tools/<slug>/` are copied to `public/` at the
same relative depth.

## Search

`scripts/build.js` aggregates every `tool.json` into
`public/assets/data/search-index.json` at build time. `search.js` fetches
that once, then does in-memory scoring (name match > keyword match >
description match) — no server, no third-party search service, fast enough
client-side at 1,500 entries (~200KB of JSON) without pagination tricks.

## Brand assets and the icon-generation script

`assets/icons/icon-mark.svg` and `icon-mark-maskable.svg` are the two
master vector sources for every favicon/app-icon size the site ships —
`assets/icons/og-source.svg` is a third, purpose-built for the 1200×630
social share image rather than a squeezed-in icon. `npm run generate:icons`
(`scripts/generate-icons.mjs`) rasterizes these into every size referenced
by `templates/partials/favicon-links.html`, `manifest.json`, and
`browserconfig.xml`, using `sharp`. This is a maintenance script, not part
of `npm run build` — it only needs to run when the logo changes, and its
PNG output is committed to `assets/icons/`/`assets/images/` like any other
static asset. `favicon.ico` is packed by a small hand-written encoder in
that same script rather than a dependency: the modern ICO format is just a
tiny header wrapping PNG bytes, and the obvious dependency for it
(`to-ico`) pulls in a `jimp` → `request` chain with a dozen known
vulnerabilities through long-unmaintained transitive packages — not an
acceptable trade for one file format.

## Minification

`scripts/lib/minify.js` wraps `html-minifier-terser` (HTML) and `terser`
(JS), both build-time-only devDependencies. Every generated page passes
through HTML minification right before it's written; every JS file headed
for `public/` — `assets/js/**`, each tool's `tool.js`/`logic.js`, `sw.js` —
passes through JS minification (`copyDirWithJsTransform` / `copyMinifiedJs`
in `scripts/lib/fs-helpers.js` and `scripts/build.js`) instead of a raw
file copy. Terser runs in `module: true` mode so ESM `import`/`export`
statements survive intact rather than being treated as a script. The HTML
minifier's `minifyJS` option only touches `<script>` tags with an absent
or JS-recognized `type`, so `<script type="application/ld+json">`
(structured data) is correctly left alone — minifying JSON-LD as if it
were JavaScript would corrupt it. CSS doesn't need a separate step here;
it's already minified by Tailwind's own `--minify` flag.

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
