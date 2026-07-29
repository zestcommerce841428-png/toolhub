# ToolHub — Roadmap

Tracks what's shipped, what's deliberately deferred and why, and the path
from here to the full 1,500-tool catalog. See `docs/ARCHITECTURE.md` for
the reasoning behind the foundation itself.

## Phase 1 — shipped (this build)

**Foundation, fully working end-to-end, not a mockup:**

- Build pipeline (`scripts/build.js` + `scripts/lib/*`): reads `tools/`,
  `categories/`, `pages/`, renders every page from shared templates,
  generates JSON-LD, the search index, `sitemap.xml`, `robots.txt`.
- Design system: `assets/css/tokens.css` (spacing/type/color/radius/shadow/
  motion, light + dark), Tailwind wired on top via `tailwind.config.js` +
  `assets/css/app.css`.
- Shared JS core (`assets/js/core/`): `clipboard.js`, `download.js`,
  `storage.js`, `validator.js`, `toast.js`, `theme.js`, `search.js`,
  `keyboard.js`, `utility.js`.
- Shared chrome: header (nav + live search + theme toggle), footer, tool
  page / category page / home page / static page templates, FAQ accordion
  (native `<details>`, zero JS), skip link, breadcrumbs.
- PWA shell: `manifest.json`, `sw.js` (app-shell precache + runtime
  caching), `offline.html`.
- 5 categories: Text, Developer, Security, Color, Calculators.
- 6 tools, one per major UI shape, so the pattern is proven for what comes
  next: Word Counter (live text analysis), Case Converter (multi-mode
  transform + accessible radiogroup), JSON Formatter (parse/validate/
  format with error locations), Password Generator (crypto-secure
  generation + options), HEX↔RGB Converter (bidirectional sync + native
  color picker), BMI Calculator (unit-converting numeric calculator).
- 65 unit tests (`node:test`, zero test-framework dependency) covering
  every tool's `logic.js` and the pure shared modules.
- End-to-end verified in a real headless browser (Playwright): all 6 tools'
  core interactions, Ctrl+K search, dark-mode toggle, keyboard radiogroup
  navigation, visible focus — zero console errors on any page.
- 4 static pages: About, Privacy, Terms, Contact.

## Deliberately deferred, and why

- **Icons are emoji, not a custom SVG icon system.** The spec calls for
  "Icon Tokens" / "Shared icons." Emoji are genuinely fine for a Phase 1 of
  6 tools — they're crisp at any size, need zero asset pipeline, and are
  accessible by default. They stop being fine well before tool #1,500,
  where visual consistency across a huge catalog starts to matter and
  brand identity does too. **Do this before scaling past ~50 tools**: build
  an SVG sprite (`assets/icons/sprite.svg`) with one symbol per tool/
  category, referenced via `<use>`, and switch `tool.json.icon` from an
  emoji string to a sprite symbol id.
- **No Git repository.** Git isn't installed on the machine this was built
  on. Everything here is otherwise ready to commit as-is — `.gitignore` is
  already in place (`node_modules/`, `public/`). Initialize with
  `git init && git add -A && git commit -m "Initial ToolHub foundation"`
  once Git is available, ideally before the tool count grows much further.
- **`site.config.json` has placeholder values** (`siteUrl`, contact email).
  Every canonical URL, sitemap entry, and JSON-LD `@id` is derived from
  `siteUrl` at build time, so updating one file before launch fixes every
  page — but it must be updated before this goes live, or every canonical
  URL and structured-data block points at a domain that doesn't resolve.
- **No CI.** `npm test` and `npm run build` are fast and deterministic
  enough to be a trivial GitHub Actions (or equivalent) job — add one that
  runs both on every PR before this project has many contributors, since
  the whole "add tool #9" workflow in `CONTRIBUTING.md` depends on the
  build failing loudly when a tool's metadata is wrong.
- **No Lighthouse CI.** The design system and templates are built to hit
  100/100/100/100, but that's a claim that needs continuous verification,
  not a one-time check — wire in `lighthouse-ci` (or a simpler scripted
  Lighthouse run against `npm run serve`) once there's a CI pipeline to
  hang it off of.
- **DOM-dependent modules aren't unit tested.** `clipboard.js`,
  `storage.js`, `toast.js`, `theme.js`, `search.js`, and `keyboard.js` all
  touch `document`/`window`/`navigator` directly, which plain `node:test`
  can't exercise without a DOM shim. They *are* covered by the Playwright
  pass (theme toggle, search, radiogroup keyboard nav all went through
  real browser interactions), but that was a manual verification run, not
  a checked-in test. **Next step**: either add `jsdom` as a devDependency
  and unit-test these directly, or formalize the Playwright script used
  for verification into `tests/e2e/` and run it in CI against
  `npm run serve`. Either is a reasonable choice — jsdom is faster and
  cheaper; Playwright is closer to what a real user experiences. Not doing
  both — that's redundant coverage for a site this size.
- **Router.js, mentioned in earlier planning, is intentionally not built.**
  This is a multi-page static site by design (see `docs/ARCHITECTURE.md`)
  — every tool and category is its own real URL for SEO, so client-side
  routing would fight that goal rather than help it. Not a gap; a
  correction to the original module list.
- **Shared modules not yet created**: `modal.js`, `favorites.js`,
  `history.js`, `color.js`, `date.js`, `math.js`, `random.js`, `csv.js`,
  `json.js`, `table.js`, `dragdrop.js`, `focus.js`, `scroll.js`. Each gets
  built in the phase where a real tool first needs it — see
  `docs/CONTRIBUTING.md`'s "never stub a module" rule. A few are likely
  soon: `random.js` (backing the whole Random category), `date.js`
  (Date & Time category), `color.js` (once a second color tool needs HSL/
  CMYK math beyond what `hex-rgb-converter/logic.js` covers).

## Phase 2 — next up

Following the category weights from the original catalog target
(Text 100, Developer 150, Color 60, Unit Converters 120, Calculators 150,
Ecommerce 150, SEO 150, Security 120, Web Utilities 120, File & Data 150,
Date & Time 80, Random 100 ≈ 1,450 tools total):

1. Fix the deferred items above that are cheap now and expensive later:
   Git init, real `site.config.json` values, CI with test+build+Lighthouse.
2. Round out the 5 existing categories closer to their target counts,
   reusing the `logic.js`-sharing pattern from `CONTRIBUTING.md`
   wherever a tool is a thin variant of one already built (e.g. Uppercase/
   Lowercase/Sentence Case/Toggle Case/Capitalize Words as five thin
   wrappers around `case-converter/logic.js`; SHA-256/SHA-512/MD5
   generators as thin wrappers around a new `hash-generator` family).
3. Add the categories not yet represented: Unit Converters, Ecommerce,
   SEO, Web Utilities, File & Data, Date & Time, Random — one
   `category.json` plus a first tool each, proving the pattern extends
   cleanly before batch-producing the rest.
4. Build the SVG icon sprite once there are enough tools that emoji
   inconsistency actually shows.
5. Formalize automated browser testing (jsdom or `tests/e2e/`, per above).

## Phase 3+ — scale-out

Once the pattern is proven across all planned categories: batch-add
remaining tools in category-sized batches (each batch = one reviewable
PR), keep `npm test` and the build's schema validation as the safety net
that catches a malformed `tool.json` before it ships, and revisit
performance (bundle-free by construction, but re-verify Lighthouse scores
periodically as the homepage's featured/category grids grow) and the
search index's payload size (currently negligible; worth paginating or
chunking well before 1,500 entries if it ever approaches ~500KB).
