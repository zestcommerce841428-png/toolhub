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

**Phase 1.7 — shipped (brand icon system + production minification):**

- Full brand/favicon icon set generated from two hand-authored master SVGs
  (`assets/icons/icon-mark.svg`, `icon-mark-maskable.svg`) via
  `npm run generate:icons` (`scripts/generate-icons.mjs`, using `sharp`):
  16/32/48/96px favicons + `favicon.ico`, four Apple touch icon sizes,
  the full PWA manifest set (192/256/384/512, plus maskable 192/512), four
  Windows tile sizes with `browserconfig.xml`, a Safari `mask-icon.svg`,
  and a designed 1200×630 Open Graph/Twitter share image
  (`assets/images/og-default.png`, generated from `og-source.svg`) — which
  was previously referenced in every page's meta tags but didn't actually
  exist as a file. The header/footer wordmark badge and `favicon.svg` were
  also updated to the same blue→navy gradient so the mark is visually
  identical everywhere it appears, rather than a flat-color badge next to
  a gradient favicon. `to-ico` was evaluated and rejected for the `.ico`
  step — it pulls in `jimp` → `request` → 12 known vulnerabilities (5
  critical) via long-abandoned transitive dependencies; wrote a ~40-line
  dependency-free ICO packer instead (the format is just a small header
  wrapping PNG bytes).
- Production minification: every generated HTML page now goes through
  `html-minifier-terser`, and every shipped JS file (`assets/js/**`, each
  tool's `tool.js`/`logic.js`, `sw.js`) through `terser`, both as build-time
  devDependencies (same category as `tailwindcss` — nothing ships to the
  browser). JSON-LD `<script>` blocks are correctly left untouched (verified
  explicitly, since minifying structured data as JS would corrupt it), and
  terser runs in `module: true` mode so ESM `import`/`export` survive
  minification intact. CSS was already minified via Tailwind's own
  `--minify` flag. Verified with the full 75-test unit suite plus a fresh
  Playwright pass (22+9 functional checks, 48-combination responsive sweep)
  against the minified output specifically, not just the unminified source.

**Phase 2 — shipped (all 12 planned categories now exist; 19 tools total):**

- Added the 7 previously-unrepresented categories from the original catalog
  target — Unit Converters, Ecommerce, SEO, Web Utilities, File & Data,
  Date & Time, Random — each with one fully-realized tool proving the
  pattern extends cleanly: Length Converter, SKU Generator, Meta Tag
  Generator, UUID Generator, Base64 Encoder/Decoder, Age Calculator, and
  Random Number Generator. Site total: 5 → 12 categories, 12 → 19 tools.
  Each new tool picked a UI shape not yet covered (dropdown-driven
  conversion, form-to-code-snippet generation, native date-input math,
  encode/decode direction toggle, constrained-random list output) rather
  than repeating an existing pattern, so the breadth of proven patterns
  grew along with the category count.
- Extracted `assets/js/core/random.js` (`secureRandomInt`, `secureShuffle`,
  `secureChoice`) out of `password-generator/logic.js`'s private
  implementation once a second tool (`uuid-generator`) needed the same
  capability — exactly the moment `docs/ARCHITECTURE.md` said this module
  would get built. `password-generator` was refactored to use the shared
  version (all its existing tests still pass unmodified, since they assert
  behavior, not implementation). Two more tools (`random-number-generator`,
  `sku-generator`) now use it too — three real call sites justified the
  shared module, versus the CONTRIBUTING.md-documented `logic.js`-sharing
  pattern, which was the right choice here since the *randomness
  primitive* is shared, not the tool-specific logic built on top of it.
- **Redesigned the header nav from inline category links to a single
  "Categories" dropdown**, found necessary while regression-testing the
  new categories: the inline-nav approach (added in the earlier spacing-
  bug fix round, tuned for 5–6 categories) overflowed again at 1024–1100px
  the moment a 7th–12th category existed, because a header can only fit so
  many inline text links no matter where the breakpoint is set. A
  fixed-width dropdown trigger (`<details>`, the same pattern already used
  for the old mobile menu) scales to any category count without needing
  another breakpoint tuned to today's count — the dropdown now also
  doubles as the mobile menu, so there's one nav implementation instead of
  two. This should be the last time category count forces a header change
  before the 1,500-tool target.
- Found and fixed a real timezone bug while writing `age-calculator`'s
  tests: `nextBirthdayDate.toISOString().slice(0, 10)` converts a
  local-midnight `Date` to UTC first, which silently shifts the displayed
  date back by one day in any timezone ahead of UTC. Fixed with a
  local-getters-based formatter instead of `toISOString`. Caught by the
  unit tests before this ever reached a browser.
- Verified: 140 unit tests (up from 75), the original 22-check functional
  suite, the 9-check case-family suite (with its "12 tools" assertion
  updated to 19 — a stale expectation, not a bug), a new 14-check suite
  covering all 7 new tools, and a fresh 48-combination responsive sweep —
  all clean, zero console errors, against the actual minified build.

## Deliberately deferred, and why

- **Per-tool icons (the emoji shown on each tool card, e.g. 📝) are still
  emoji, not part of the SVG icon system above** — that system covers the
  site's own brand/favicon identity, a separate concern from each tool's
  catalog icon. Emoji are genuinely fine for a catalog of 12 tools — crisp
  at any size, zero asset pipeline, accessible by default. They stop being
  fine well before tool #1,500, where visual consistency across a huge
  catalog starts to matter. **Do this before scaling past ~50 tools**:
  build an SVG sprite (`assets/icons/tool-sprite.svg`) with one symbol per
  tool/category, referenced via `<use>`, and switch `tool.json.icon` from
  an emoji string to a sprite symbol id.
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
  `history.js`, `color.js`, `date.js`, `math.js`, `csv.js`, `json.js`,
  `table.js`, `dragdrop.js`, `focus.js`, `scroll.js`. (`random.js` was in
  this list — now shipped, see Phase 2 above.) Each gets built in the
  phase where a real tool first needs it — see `docs/CONTRIBUTING.md`'s
  "never stub a module" rule. `date.js` is likely next (Date & Time
  category has one tool so far); `color.js` once a second color tool
  needs HSL/CMYK math beyond what `hex-rgb-converter/logic.js` covers.

**Phase 2.5 — shipped (fixed two real, silent CSS build bugs behind a user
report that cards "didn't look professional"):**

- **`.tool-card` and every class it depends on had been silently absent
  from the compiled CSS since the very first build.** `tailwind.config.js`'s
  content glob never scanned `scripts/**/*.js`, and `renderToolCard`/
  `renderCategoryCard` (in `scripts/build.js`) are the *only* place those
  class name strings ever appear — Tailwind's JIT purges any custom
  `@layer components` class it doesn't see referenced in a scanned file,
  silently, with no build error. Every tool and category card on the site
  had been rendering as unstyled text with an emoji in front of it the
  entire time; it read as a design problem, not a build bug, until
  screenshots were compared against the raw compiled CSS byte-for-byte.
  Fixed by adding `./scripts/**/*.js` to the content glob.
- **Opacity-modified custom colors (`bg-primary/10`, `border-danger/40`,
  …) had been silently compiling to nothing** wherever they were only
  reachable via `@apply` (once the glob fix above made Tailwind actually
  try to process them, it surfaced as a hard `hover:border-primary/50`
  class-does-not-exist build error, rather than the previous silent
  drop). Root cause: `--color-primary` and friends were stored as opaque
  hex strings, and Tailwind can't blend an alpha channel into a hex
  string inside a CSS custom property at build time. Fixed by adding a
  `-rgb` (space-separated channel) companion token for every color that
  needs opacity support, and pointing `tailwind.config.js` at
  `rgb(var(--color-x-rgb) / <alpha-value>)` for those keys — see
  `docs/ARCHITECTURE.md`'s "Design tokens" section for the full pattern.
- Redesigned the card component while fixing this (icon in a tinted
  rounded badge, stronger border/shadow so it doesn't depend on a tinted
  section background to read as a card, hover lift, footer arrow) —
  worth doing regardless, but the *reason* cards looked broken was the
  two bugs above, not the visual design of the previous version.
- Verified: full 140-test unit suite, all three Playwright functional
  suites (45 checks total), the 48-combination responsive sweep, plus new
  targeted checks — hover state, dark mode, BMI status badges, and a
  toast notification, since the opacity-color fix touches every one of
  those. All clean.

## Phase 3 — shipped (50-tool batch: 19 → 69 tools)

Following the category weights from the original catalog target
(Text 100, Developer 150, Color 60, Unit Converters 120, Calculators 150,
Ecommerce 150, SEO 150, Security 120, Web Utilities 120, File & Data 150,
Date & Time 80, Random 100 ≈ 1,450 tools total). Current: 69/1,450.

Added 50 tools in one sitting, batched by category (each batch its own
commit — `git log` for the individual messages, which each explain that
batch's specific design decisions and any bugs found while building it)
rather than one undifferentiated commit, per the "each batch = one
reviewable PR" principle below:

- **Developer** (+6): MD5/SHA-1/SHA-256/SHA-512 hash generators, URL
  encoder/decoder, JWT decoder. MD5 is hand-implemented (RFC 1321) since
  Web Crypto doesn't expose it; the SHA family shares a new
  `assets/js/core/hash.js`.
- **Unit Converters** (+6): weight, temperature, volume, area, speed,
  data storage — all but temperature follow `length-converter`'s
  factor-per-unit pattern exactly, as predicted below. Temperature needed
  its own offset-aware formulas. Data storage deliberately keeps decimal
  (KB) and binary (KiB) units separate rather than conflating them.
- **Calculators** (+6): percentage, discount, tip, simple interest,
  compound interest, loan/EMI (with a full amortization schedule).
- **Ecommerce** (+4): profit margin, markup, and a real EAN-13/UPC-A
  barcode family — genuine ISO/IEC 15420 bar-pattern encoding, not a
  placeholder striped image, verified against real published barcodes.
- **SEO** (+4): richer Open Graph tags (type-specific fields beyond the
  existing Meta Tag Generator), robots.txt generator, XML sitemap
  generator, slug generator (real Unicode NFKD transliteration).
- **Security** (+4): password strength checker (pattern detection beyond
  raw entropy), HMAC generator, genuine AES-256-GCM text encryption
  (PBKDF2 + Web Crypto), Base32 codec (hand-implemented RFC 4648, no
  browser built-in exists).
- **Web Utilities** (+4): UTM builder, user-agent parser, HTTP status
  code reference, query string parser/builder.
- **File & Data** (+4): a new shared `assets/js/core/csv.js` (the module
  this doc predicted would get built once two tools needed it) backing
  CSV↔JSON converters, a real LCS text diff, and a hand-written Markdown
  → HTML converter with a live preview.
- **Date & Time** (+4): countdown timer, date difference calculator,
  Unix timestamp converter, business days calculator — all following
  `age-calculator`'s established local-date-parsing convention to avoid
  reintroducing the timezone bug documented above.
- **Random** (+3): random string generator, dice roller, random
  picker/team-splitter — all on the existing secure-randomness core.
- **Color** (+3): contrast checker (real WCAG luminance math), palette
  generator (real HSL hue rotation), gradient generator — all three
  reuse `hex-rgb-converter`'s parser rather than re-implementing it.
- **Text** (+2): duplicate line remover, find & replace (real regex with
  capture-group support).

**The `logic.js`-sharing pattern predicted in the previous version of
this section proved out repeatedly**, beyond the two cases already
proven: `hash.js` (SHA family), `csv.js` (CSV↔JSON), and
`hex-rgb-converter`'s parser (three Color tools) all followed the same
"extract once 2-3 real call sites exist" rule from `CONTRIBUTING.md`.

**Real bugs found and fixed while building, not just at the end** — each
one caught by writing a test *before* trusting the implementation, or by
a real-browser check that unit tests alone couldn't have caught:
- A JWT-decoder-adjacent HMAC generator crashed on an empty secret
  (`crypto.subtle.importKey` rejects a zero-length key) — found via
  browser testing, not unit tests, since the unit tests always passed a
  secret.
- The Markdown converter's placeholder tokens (used to protect
  already-rendered code spans and hard line breaks from further regex
  passes) originally shared one numeric namespace and could collide, and
  separately contained underscores that its own italic regex then matched
  *inside its own placeholder text* — both required rewriting the
  placeholder scheme to be letters-and-digits-only and non-colliding.
- The query-string parser misread a full URL with no `?` at all (e.g.
  `https://example.com/`) as one giant key with an empty value.
- Find & Replace's `caseSensitive` option defaulted to falsy instead of
  `true` (`options.caseSensitive ? "" : "i"` treats an omitted option the
  same as an explicit `false`), so searches were silently
  case-insensitive by default — the opposite of the documented and
  UI-displayed default.
- Tailwind's preflight reset (`list-style: none` on `ul`/`ol`) meant the
  Markdown preview's generated lists rendered with no bullets/indentation
  at all — `.prose-tool` only had `p`/`h2`/`h3` rules before this; now
  covers `ul`/`ol`/`blockquote`/`pre`/`code`/`a`/`img`/`hr` too.

655 unit tests total (up from 175), all 12 categories' `related` links
now resolve with zero dangling-reference build warnings, and the full
Playwright regression suite (22+9+14 = 45 checks) stayed green throughout
— rerun and reconfirmed after every batch, not just once at the end.

**Still open from here:**
1. Round out every category further toward its target count — 69/1,450
   means there's a long way left, but the `logic.js`-sharing pattern is
   now proven across families, hash algorithms, unit converters, CSV
   handling, and color math, so the next 50-tool batch should move faster.
2. Build the SVG icon sprite now that the tool count (69) has cleared the
   "~50 tools" threshold flagged above as when emoji-as-icon stops being
   fine — genuinely due now, not just soon.
3. Formalize automated browser testing (jsdom or `tests/e2e/`) instead of
   ad-hoc Playwright scripts run from a scratchpad each session.
4. Lighthouse CI, and real `site.config.json` values before treating any
   deploy as final production output (auto-detected canonical URLs now
   work correctly on Vercel/Netlify/Cloudflare Pages — see
   `docs/ARCHITECTURE.md` — but the fallback placeholder is still what a
   local build without one of those platforms sees).

## Phase 4+ — scale-out

Batch-add remaining tools in category-sized batches (each batch = one
reviewable PR/commit — proven at 50-tool scale in Phase 3 above), keep
`npm test` and the build's schema validation as the safety net that
catches a malformed `tool.json` before it ships, and revisit performance
(bundle-free by construction, but re-verify Lighthouse scores
periodically as the homepage's featured/category grids grow) and the
search index's payload size (currently negligible; worth paginating or
chunking well before 1,500 entries if it ever approaches ~500KB).
