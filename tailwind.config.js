/**
 * Tailwind is a compile-time utility layer only — see docs/ARCHITECTURE.md.
 * Every color/radius/shadow value below is a passthrough to the CSS custom
 * properties in assets/css/tokens.css, so utilities and hand-written
 * component CSS can never drift out of sync with the design tokens.
 */
export default {
  content: [
    "./templates/**/*.html",
    "./components/**/*.html",
    "./tools/**/*.html",
    "./categories/**/*.html",
    "./pages/**/*.html",
    "./assets/js/**/*.js",
    "./tools/**/*.js",
    // scripts/build.js constructs class names as string literals when it
    // renders tool/category cards (renderToolCard, renderCategoryCard,
    // etc.) rather than reading them from a template file. Tailwind's JIT
    // purges any class whose name it never sees in a scanned file, so
    // without this, every class introduced only inside scripts/*.js — the
    // whole .tool-card family, among others — silently disappears from
    // the compiled CSS. Found via a real "cards render as unstyled text"
    // bug: this glob was missing from day one.
    "./scripts/**/*.js",
  ],
  darkMode: ["selector", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // These use the "-rgb" (space-separated channel) token variants
        // and Tailwind's `<alpha-value>` placeholder, not the plain hex
        // tokens — that's what makes bg-primary/10, border-danger/40, etc.
        // work. A CSS custom property holding an opaque hex string (the
        // plain --color-primary token, still used directly elsewhere for
        // exactly this reason) can't have opacity blended into it at
        // build time; Tailwind needs the raw R/G/B channels to construct
        // rgb(37 99 235 / 0.1) itself. See tokens.css for why both forms
        // of each token exist side by side. Found via a real build
        // failure: `hover:border-primary/50` doesn't compile without this.
        primary: {
          DEFAULT: "rgb(var(--color-primary-rgb) / <alpha-value>)",
          hover: "rgb(var(--color-primary-hover-rgb) / <alpha-value>)",
          fg: "rgb(var(--color-primary-fg-rgb) / <alpha-value>)",
        },
        secondary: "rgb(var(--color-secondary-rgb) / <alpha-value>)",
        accent: "rgb(var(--color-accent-rgb) / <alpha-value>)",
        success: "rgb(var(--color-success-rgb) / <alpha-value>)",
        warning: "rgb(var(--color-warning-rgb) / <alpha-value>)",
        danger: "rgb(var(--color-danger-rgb) / <alpha-value>)",
        info: "rgb(var(--color-info-rgb) / <alpha-value>)",
        bg: "var(--color-bg)",
        surface: "var(--color-surface)",
        "surface-raised": "var(--color-surface-raised)",
        border: "var(--color-border)",
        "border-strong": "var(--color-border-strong)",
        text: "var(--color-text)",
        "text-muted": "var(--color-text-muted)",
        "text-subtle": "var(--color-text-subtle)",
      },
      // NOTE: deliberately not overriding Tailwind's numeric spacing scale.
      // tokens.css's --space-N custom properties use an "N x 8px" naming
      // convention for hand-written CSS/JS, which collides with Tailwind's
      // own numeric spacing keys — Tailwind's "8" already means 8 x 0.25rem
      // (32px) everywhere a class like `gap-4`/`px-4`/`w-8` is used across
      // every template and tool. Aliasing spacing["8"] to --space-8 (64px)
      // here previously made every one of those utilities render at roughly
      // 2x its intended size sitewide — found via a Playwright viewport
      // sweep that traced a header overflow back to this file. The
      // --space-N tokens remain valid as a standalone scale for hand-written
      // CSS (see tokens.css); they just don't drive Tailwind's own utilities.
      fontFamily: {
        sans: "var(--font-sans)",
        mono: "var(--font-mono)",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        DEFAULT: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        full: "var(--radius-full)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        DEFAULT: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
      },
      transitionDuration: {
        fast: "var(--duration-fast)",
        normal: "var(--duration-normal)",
        slow: "var(--duration-slow)",
      },
    },
  },
  plugins: [],
};
