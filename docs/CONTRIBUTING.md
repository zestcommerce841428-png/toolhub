# Contributing to ToolHub

This document is the fast path to adding tool #9 (and #900). Read
`docs/ARCHITECTURE.md` first if you haven't — it explains *why* the project
is shaped this way; this file is the *how*.

## Setup

Requires Node 20+ (built and tested on Node 24) and npm. No other global
tooling.

```bash
npm install          # installs the build-time-only devDependencies (see below)
npm run build        # cleans public/, generates every page, compiles CSS
npm run serve        # serves public/ at http://localhost:4173
npm test             # runs tests/unit/**/*.test.js via node:test
npm run test:e2e     # runs tests/e2e/**/*.spec.js via Playwright — build+serve first
npm run test:lighthouse # runs scripts/lighthouse.mjs — build+serve first
npm run test:all     # test -> build -> test:e2e -> test:lighthouse, in that order
npm run watch:css    # recompiles Tailwind on save, while iterating on markup
```

There's no `watch` for the site generator itself — `scripts/build.js` runs
in well under a second even at this project's current size, so re-running
`npm run build:site` after an edit is fast enough not to need a watcher.
Revisit that if per-build time becomes noticeable as the tool count grows.

Every devDependency here is build-time-only — nothing in `devDependencies`
ships to the browser (see `docs/ARCHITECTURE.md`'s "Runtime vs. build-time"
section). Each one was chosen deliberately, not just installed for
convenience: `to-ico` was rejected outright for a vulnerable transitive
chain (a hand-written ICO packer replaced it, see
`scripts/generate-icons.mjs`), and `@lhci/cli` was rejected the same way
in favor of the plain `lighthouse` package (see `scripts/lighthouse.mjs`'s
doc comment) — both are worth reading before reaching for a convenience
wrapper around a real dependency.

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
persisted preference, `random.js` for anything needing unpredictable
values. See `docs/ARCHITECTURE.md` for the full module list. Import these
with an absolute path: `import { secureRandomInt } from "/assets/js/core/random.js";`

**If `logic.js` itself needs a core module** (not just `tool.js`), the
import path must be *relative* instead — `../../assets/js/core/random.js`,
not `/assets/js/core/random.js`. `logic.js` files are imported directly by
`tests/unit/*.test.js` under plain Node, where a leading `/` resolves as a
filesystem-absolute path and breaks; a relative path resolves correctly
both there and once copied into `public/tools/<slug>/logic.js`. See
`tools/uuid-generator/logic.js` or `tools/sku-generator/logic.js` for a
working example.

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

## CI/CD

`.github/workflows/ci.yml` runs on every push and pull request, as four
jobs:

- **unit-tests** — `npm test` (no build/browser dependency, so it reports
  back fastest).
- **build** — `npm run build`, then uploads `public/` as a shared artifact
  the other two jobs below reuse rather than each rebuilding it.
- **e2e** — the full `tests/e2e/` Playwright suite (see that directory's
  files for what's covered) against the real, minified, production-shaped
  build — not a dev-mode reconstruction of it.
- **lighthouse** — `scripts/lighthouse.mjs` against the same build,
  gated on this project's actual measured Lighthouse scores (currently
  99-100 across performance/accessibility/best-practices/SEO on every
  audited page — see that script's own doc comment for the thresholds
  and the two real accessibility bugs measuring them for real, rather
  than assuming a perfect score, actually caught).

`master` requires all four to pass before a pull request can merge
(branch protection, configured via the GitHub API — not committed to the
repo, since branch protection is a GitHub setting, not a file). Direct
pushes to `master` are unaffected — this only gates the PR merge button,
which matters most for the automated Dependabot PRs described below.

A separate workflow, `.github/workflows/post-deploy-smoke.yml`, fires
from GitHub's native `deployment_status` event (which Vercel's GitHub
integration uses to report every deployment) and runs a lightweight smoke
check against the real, live **production** URL specifically — not
preview deployments, which sit behind this project's Vercel deployment
protection (a 302 to a Vercel login page there is that protection working
correctly, not a bug). This is the check that answers "is the actually-
deployed site broken," a genuinely different question from "did the local
build pass," which is all `ci.yml` can see.

`.github/dependabot.yml` opens a PR weekly for outdated devDependencies
(grouped: Playwright/lighthouse/chrome-launcher move in lockstep — see
`scripts/lighthouse.mjs`) and outdated pinned GitHub Actions versions,
gated by the same required status checks — a major-version bump (e.g.
Tailwind v3 → v4, which changes its config format entirely) will show as
a failing PR rather than silently merging, which is exactly the point.

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
- [ ] If your tool adds a new page pattern (not just a thin family
      wrapper), consider adding it to `tests/e2e/tool-functionality.spec.js`
      — the full-catalog crawl in `tests/e2e/site-crawl.spec.js` already
      covers every tool's baseline page health automatically, with
      nothing to update by hand.
- [ ] FAQ entries are genuinely useful, not filler — see `docs/ROADMAP.md`
      re: why placeholder FAQ content is worse than none.
