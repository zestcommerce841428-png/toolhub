# Contributing to ToolHub

This document is the fast path to adding tool #9 (and #900). Read
`docs/ARCHITECTURE.md` first if you haven't — it explains *why* the project
is shaped this way; this file is the *how*.

## Setup

Requires Node 20+ (built and tested on Node 24) and npm. No other global
tooling.

```bash
npm install       # installs the one devDependency: tailwindcss
npm run build     # cleans public/, generates every page, compiles CSS
npm run serve     # serves public/ at http://localhost:4173
npm test          # runs tests/unit/**/*.test.js via node:test
npm run watch:css # recompiles Tailwind on save, while iterating on markup
```

There's no `watch` for the site generator itself — `scripts/build.js` runs
in well under a second even at this project's current size, so re-running
`npm run build:site` after an edit is fast enough not to need a watcher.
Revisit that if per-build time becomes noticeable as the tool count grows.

## Adding a new tool

Every tool is a folder under `tools/<slug>/` with up to five files:

```
tools/word-counter/
├── tool.json      # required — metadata, SEO, FAQ
├── content.html   # required — the tool's unique body markup
├── tool.css       # required (even if just a comment) — page always links it
├── tool.js        # required (even if trivial) — page always loads it
└── logic.js        # optional — pure, unit-testable functions (see below)
```

### 1. `tool.json`

```json
{
  "id": "word-counter",
  "name": "Word Counter",
  "slug": "word-counter",
  "category": "text",
  "description": "One or two sentences — becomes the meta description and card blurb.",
  "keywords": ["word counter", "character counter"],
  "difficulty": "beginner",
  "priority": "high",
  "version": "1.0.0",
  "updated": "2026-07-29",
  "icon": "📝",
  "related": ["case-converter"],
  "faq": [{ "question": "…", "answer": "…" }]
}
```

- `slug` must equal the folder name — the build fails loudly otherwise.
- `category` must be an existing `categories/<slug>/category.json` slug.
- `related` slugs that don't exist yet log a build warning and are skipped,
  not a hard failure — you can land a tool before the ones it references.
  Whether or not you list any, the category-page's "Related tools" section
  auto-backfills with other tools from the same category so it's never empty.
- `icon` is a single emoji for now — see `docs/ROADMAP.md` re: a real SVG
  icon system, which is a deliberately deferred Phase 2 item.

### 2. `content.html`

Just the inside of `<article>` — no `<h1>`/description (the tool template
already renders those from `tool.json`), no FAQ/related-tools markup (also
generated). Write the input/output/settings UI here, using the shared
component classes from `assets/css/app.css` (`.field-input`, `.btn-primary`,
`.card`, etc.) and Tailwind utilities for layout. Follow an existing tool
(`tools/word-counter/content.html` is the simplest) as a template.

**Every interactive element needs a real `<label>`** (visible or
`sr-only`), and any live-updating result needs to be reachable by keyboard
and, where it makes sense, announced via `aria-live` — copy the pattern
from an existing tool rather than inventing a new one.

### 3. `logic.js` — separate pure logic from DOM wiring

If your tool has any non-trivial logic (parsing, formatting, math,
generation), put it in `logic.js` as plain exported functions with **no
DOM access** — `document`, `window`, event listeners, all belong in
`tool.js` only. This is what makes the logic testable with plain
`node:test`, no browser or DOM shim required:

```js
// tools/my-tool/logic.js
export function doTheThing(input) { /* pure */ }
```

```js
// tests/unit/my-tool.test.js
import { doTheThing } from "../../tools/my-tool/logic.js";
```

If your tool is trivial enough that this split would be pure ceremony
(nothing to unit test), it's fine to skip `logic.js` and put everything
in `tool.js` — don't manufacture a file for its own sake.

### 4. Sharing `logic.js` across a tool family

The tool catalog intentionally has many single-purpose SEO pages that are
thin variations of the same operation — e.g. "Uppercase Converter,"
"Lowercase Converter," and "Title Case Converter" are each one function out
of `tools/case-converter/logic.js`. When you add one of these:

1. **Don't** duplicate the transform function into the new tool's folder.
2. **Do** import the specific function you need directly:
   `import { toUpperCase } from "../case-converter/logic.js";`
3. Give the new tool its own minimal `content.html`/`tool.js` (usually just
   one textarea in, one textarea out, no mode-selector UI) and its own
   `tool.json` targeting its own keyword.

This keeps 1,500 catalog entries from becoming 1,500 copies of the same
handful of algorithms.

### 5. `tool.js`

DOM wiring only: grab elements by id, wire events, call into `logic.js`,
update the DOM. Import shared behavior from `assets/js/core/*` rather than
reimplementing it — `clipboard.js` for Copy buttons, `download.js` for
Download buttons, `toast.js` for transient feedback, `storage.js` for any
persisted preference. See `docs/ARCHITECTURE.md` for the full module list.

### 6. Register it and build

Nothing else to wire up — `scripts/build.js` discovers every folder under
`tools/`, so once the four required files exist, `npm run build` picks it
up: the category page, the homepage's featured grid (if `priority: "high"`),
the search index, the sitemap, and other tools' "related" backfill all
update automatically.

## Adding a new category

Add `categories/<slug>/category.json`:

```json
{ "id": "my-category", "name": "My Category", "slug": "my-category", "description": "…", "icon": "🧰" }
```

The header/footer nav, `/categories/`, and the homepage's category grid all
regenerate from this directory — no other file to touch.

## Code conventions (enforced by review, not tooling, for now)

- ES modules only, no globals, no inline `<script>`/`style="…"` in
  hand-authored HTML (dynamic, data-driven inline *styles* set from JS —
  like a color swatch's background — are fine; that's not what this rule
  is about).
- Small, single-responsibility functions; no duplicate logic — if you're
  about to copy a function, import it instead.
- Comments explain *why*, not *what* — see the root `CLAUDE.md`-equivalent
  guidance in this repo's system instructions if you're an AI agent
  contributing here.
- Every new pure-logic module gets a `tests/unit/<slug>.test.js`.

## Before you consider a tool done

- [ ] Keyboard-only: can you complete the tool's core task with no mouse?
- [ ] Focus is visible at every step (this is automatic if you used the
      shared component classes — don't override `outline`).
- [ ] Labels exist for every input, including icon-only buttons
      (`aria-label`).
- [ ] Works in both themes — check the dark-mode screenshot, don't just
      trust the tokens.
- [ ] `npm test` passes; `npm run build` produces no warnings for your tool.
- [ ] FAQ entries are genuinely useful, not filler — see `docs/ROADMAP.md`
      re: why placeholder FAQ content is worse than none.
