/**
 * Minimal {{TOKEN}} template renderer for the static-site build.
 * Deliberately not a general-purpose templating language (no loops/
 * conditionals in the syntax) — loops/conditionals happen in JS (build.js
 * builds the HTML fragments for repeated things like tool cards), and this
 * just splices already-rendered strings into the page shell. Keeping the
 * template language this small is what lets templates/*.html stay
 * reviewable by anyone who knows HTML, no build-tool DSL required.
 */

// Reused verbatim from the browser runtime module — it's pure string logic
// with no DOM dependency, so importing it here (instead of redefining it)
// keeps escaping behavior identical between build-time and run-time HTML
// generation, per the project's "never duplicate logic" rule.
export { escapeHtml } from "../../assets/js/core/utility.js";

const TOKEN_RE = /\{\{([A-Z0-9_]+)\}\}/g;

/**
 * @param {string} template - raw template source containing {{TOKENS}}
 * @param {Record<string,string>} data - token -> replacement HTML/text
 * @param {string} [templateName] - for error messages
 * @returns {string}
 */
export function renderTemplate(template, data, templateName = "template") {
  const rendered = template.replace(TOKEN_RE, (match, key) => {
    if (!(key in data)) {
      throw new Error(`[${templateName}] missing value for placeholder {{${key}}}`);
    }
    return data[key];
  });

  const leftover = rendered.match(TOKEN_RE);
  if (leftover) {
    throw new Error(`[${templateName}] unresolved placeholders after render: ${leftover.join(", ")}`);
  }

  return rendered;
}
