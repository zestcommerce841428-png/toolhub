/**
 * Production minification for the generated site — HTML pages and every
 * JS file copied into public/. CSS is already minified separately by
 * Tailwind's own `--minify` flag (see package.json's build:css script),
 * so it isn't handled here.
 *
 * Both html-minifier-terser and terser are devDependencies used only at
 * build time, in the same category as tailwindcss itself — nothing here
 * ships to the browser as a runtime dependency.
 */
import { minify as minifyHtml } from "html-minifier-terser";
import { minify as minifyJs } from "terser";

const HTML_OPTIONS = {
  collapseWhitespace: true,
  conservativeCollapse: false,
  removeComments: true,
  removeRedundantAttributes: true,
  removeEmptyAttributes: false, // some empty attrs (e.g. alt="") are semantically meaningful
  collapseBooleanAttributes: true,
  useShortDoctype: true,
  minifyCSS: true,
  // minifyJS only touches <script> tags whose type is absent or a
  // recognized JS type (text/javascript, module, ...) — it correctly
  // leaves `<script type="application/ld+json">` (JSON-LD structured
  // data) untouched, which matters: minifying that as JS would corrupt it.
  minifyJS: true,
  sortAttributes: false,
  sortClassName: false,
};

/**
 * @param {string} html
 * @param {string} [context] - for error messages
 * @returns {Promise<string>}
 */
export async function minifyHtmlString(html, context = "html") {
  try {
    return await minifyHtml(html, HTML_OPTIONS);
  } catch (error) {
    throw new Error(`[minify] Failed to minify ${context}: ${error.message}`);
  }
}

const JS_OPTIONS = {
  module: true, // preserve import/export semantics rather than assuming a script/IIFE
  compress: true,
  mangle: true,
  format: { comments: false },
};

/**
 * @param {string} code
 * @param {string} [context] - for error messages
 * @returns {Promise<string>}
 */
export async function minifyJsString(code, context = "script") {
  try {
    const result = await minifyJs(code, JS_OPTIONS);
    return result.code ?? code;
  } catch (error) {
    throw new Error(`[minify] Failed to minify ${context}: ${error.message}`);
  }
}
