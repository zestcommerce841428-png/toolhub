/**
 * JSON-LD builders. Each function returns a plain object (a schema.org
 * node); build.js combines them into a single @graph and serializes once
 * per page, so a page never ships more than one <script type="application/ld+json">.
 */

/**
 * @param {Array<{name: string, url: string}>} items - ordered Home -> ... -> current
 */
export function breadcrumbSchema(items) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/** @param {Array<{question: string, answer: string}>} faq */
export function faqSchema(faq) {
  if (!faq || faq.length === 0) return null;
  return {
    "@type": "FAQPage",
    mainEntity: faq.map((entry) => ({
      "@type": "Question",
      name: entry.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: entry.answer,
      },
    })),
  };
}

/**
 * @param {object} tool - parsed tool.json
 * @param {string} canonicalUrl
 */
export function softwareApplicationSchema(tool, canonicalUrl) {
  return {
    "@type": "SoftwareApplication",
    name: tool.name,
    description: tool.description,
    url: canonicalUrl,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any (runs in any modern browser)",
    softwareVersion: tool.version,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
}

/**
 * Wraps one or more schema.org nodes into a single JSON-LD <script> tag
 * using @graph, and drops any null entries (e.g. a tool with no FAQ yet).
 * @param {string} siteUrl
 * @param {Array<object|null>} nodes
 */
export function renderJsonLd(siteUrl, nodes) {
  const graph = nodes.filter(Boolean);
  const payload = {
    "@context": "https://schema.org",
    "@graph": graph,
  };
  return `<script type="application/ld+json">${JSON.stringify(payload)}</script>`;
}
