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
  ],
  darkMode: ["selector", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--color-primary)",
          hover: "var(--color-primary-hover)",
          fg: "var(--color-primary-fg)",
        },
        secondary: "var(--color-secondary)",
        accent: "var(--color-accent)",
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        danger: "var(--color-danger)",
        info: "var(--color-info)",
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
