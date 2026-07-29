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
- GitHub Actions CI (`.github/workflows/ci.yml`): `npm test` + `npm run
  build` on every push/PR.

**Phase 1.5 — shipped (proved the tool-family pattern):**

- 6 more tools, all thin wrappers around `tools/case-converter/logic.js`
  (Uppercase Converter, Lowercase Converter, Title Case Converter,
  Sentence Case Converter, Toggle Case Converter, Capitalize Words) — see
  `docs/CONTRIBUTING.md`'s "sharing logic.js across a tool family."
  **12 tools total, 8 in Text.** This was previously documented as a
  pattern but never actually built; it's now proven end-to-end (each page
  reuses the shared, already-unit-tested transform functions, adds zero
  new logic, and cross-links back to the full Case Converter).
- Along the way, found and fixed a real content bug this pattern exposed:
  `tools/case-converter/tool.json`'s own FAQ had an example
  (`'hELLO wORLD'`) where Title Case and Capitalize Words happen to
  produce visually similar-looking wrong output, so the "difference"
  being explained wasn't actually demonstrated. Replaced with an example
  (`'heLLo woRLd'`) that actually shows the two modes diverging — a good
  reminder to eyeball FAQ examples against the real function output, not
  just prose-review them.

**Phase 1.6 — shipped (site URL auto-detection + a responsive/UI audit):**

- Site URL auto-detection from the hosting platform's build-time env vars
  (see `docs/ARCHITECTURE.md`, "Site URL resolution"), replacing the
  hardcoded `site.config.json` value everywhere it matters — canonical
  tags, sitemap, robots.txt, JSON-LD.
- A full Playwright viewport sweep (320px through 1920px, every page) to
  actually verify the "no broken layouts" requirement instead of assuming
  it from a couple of desktop screenshots. It found three real bugs:
  1. **Header nav overflow at 768–900px** (up to 141px) — the 6-link nav
     needs ~526px alone, which doesn't fit next to the logo/search/theme
     toggle below `lg` (1024px). Fixed by moving the nav's breakpoint from
     `md` to `lg`, with the compact `<details>` menu covering the gap.
  2. **A sitewide spacing bug**, found while chasing a smaller header
     overflow at 320–375px: `tailwind.config.js` aliased its numeric
     `spacing` keys (`gap-4`, `px-4`, `w-8`, etc.) to `tokens.css`'s
     `--space-N` custom properties, which use a different convention
     ("N × 8px") than Tailwind's own ("N × 0.25rem") — silently doubling
     spacing on every utility using keys 0.5–12 across every page, not
     just the header. Fixed by not remapping Tailwind's spacing scale at
     all; `--space-N` remains a separate, valid token set for hand-written
     CSS. This is the single most impactful fix in this round — see
     `docs/ARCHITECTURE.md`'s "Design tokens" section.
  3. **Empty "Related tools" section** on any tool that's currently the
     only one in its category (Password Generator, JSON Formatter,
     HEX/RGB Converter, BMI Calculator all were) — a heading over a blank
     grid. Fixed by omitting the whole section when there's nothing to
     backfill with; it reappears once a category's second tool ships.
- Also fixed the underlying flexbox gotcha that made the header's search
  box unable to shrink properly: text `<input>`s carry a browser-default
  intrinsic minimum width that a percentage `width` doesn't override on
  its own. Added `min-w-0` to the shared `.field-input`/`.field-textarea`/
  `.field-select` classes in `assets/css/app.css` so this can't recur in
  any future tool that places a form field in a constrained container.
- Verified with the full 75-test unit suite, the existing 22+9-check
  Playwright functional regression (all 12 tools, search, theme toggle,
  keyboard nav), and a fresh 48-combination (12 widths × 4 pages) overflow
  + nav-visibility sweep — all clean, zero console errors.

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
- ~~No Git repository~~ **Done.** Initialized and committed
  (`0112e53`). Note: no global `user.name`/`user.email` was configured on
  the build machine, so Git auto-derived a commit identity from the OS
  account — verify `git config user.name`/`user.email` are what you want
  before pushing anywhere, and `git commit --amend --reset-author` if not.
- ~~`site.config.json` has a hardcoded placeholder `siteUrl`~~ **Fixed.**
  `scripts/lib/site-url.js` now resolves the real URL automatically from
  the hosting platform's own build-time env vars (Vercel/Netlify/
  Cloudflare Pages/GitHub Pages, or an explicit `SITE_URL` override) — see
  `docs/ARCHITECTURE.md`'s "Site URL resolution" section. `site.config.json`'s
  `siteUrl` is now only the last-resort fallback for a local build with
  none of those present, which still needs a real value if you intend to
  publish that specific build's output somewhere the resolver can't detect.
  Contact email in `pages/contact/content.html` is still a placeholder —
  that one can't be auto-detected from anything; update it directly.
- ~~No CI~~ **Partially done.** `.github/workflows/ci.yml` runs `npm test`
  and `npm run build` on every push/PR, so a malformed `tool.json`, a
  missing `tool.css`/`tool.js`, or a broken template placeholder now fails
  the build loudly in CI, not just locally. Unverified against a real
  GitHub remote (none is configured yet) — check the Actions tab after the
  first push.
- **No Lighthouse CI yet.** The design system and templates are built to
  hit 100/100/100/100, but that's a claim that needs continuous
  verification, not a one-time check. Natural next step now that
  test+build CI exists: add a job that runs `npm run build`, serves
  `public/` (`npm run serve` or any static server), and runs
  `@lhci/cli` against a few representative URLs (home, one category, one
  tool) with asserted score thresholds.
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

1. ~~Fix the deferred items above that are cheap now and expensive
   later~~ **Git init and CI (test+build) done.** Still open: real
   `site.config.json` values (needs the site owner), Lighthouse CI.
2. Round out the 5 existing categories closer to their target counts,
   reusing the `logic.js`-sharing pattern from `CONTRIBUTING.md`
   wherever a tool is a thin variant of one already built — **proven**:
   Uppercase/Lowercase/Title Case/Sentence Case/Toggle Case/Capitalize
   Words now ship as six thin wrappers around `case-converter/logic.js`
   (Text is at 8/100 tools). Same pattern applies well to, e.g., SHA-256/
   SHA-512/MD5 generators as thin wrappers around a new `hash-generator`
   family, once Security's first hash tool exists to wrap.
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
