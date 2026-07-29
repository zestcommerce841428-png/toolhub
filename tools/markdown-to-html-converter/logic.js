/**
 * A real, hand-written Markdown-to-HTML converter covering the common
 * subset: headings, paragraphs, bold/italic, inline code, fenced code
 * blocks, links, images, blockquotes, ordered/unordered lists, horizontal
 * rules, and hard line breaks (trailing double-space). Not a full
 * CommonMark implementation (no nested blockquotes/lists, no tables,
 * no reference-style links) — see content.html for what's out of scope.
 *
 * Security: every block's raw text is HTML-escaped before any markdown
 * syntax is turned into real tags, so pasted `<script>` or `<img
 * onerror=...>` can never survive into the output as live markup — it
 * always ends up as inert, escaped text. Link/image URLs additionally
 * reject the `javascript:` scheme.
 */
import { escapeHtml } from "../../assets/js/core/utility.js";

function sanitizeUrl(escapedUrl) {
  if (/^\s*javascript:/i.test(escapedUrl)) return "#";
  return escapedUrl;
}

/**
 * Renders inline markdown (bold, italic, code, links, images, hard line
 * breaks) within a single block of raw (not yet HTML-escaped) text.
 * `hardBreakCount` tells this how many "BREAK_MARKER_n" tokens
 * `joinParagraphLines` already wrote into `rawText` for it to restore.
 *
 * Uses two distinct placeholder token families (CODE_n / BREAK_n) while
 * shuttling already-rendered HTML fragments through the later regex
 * passes — sharing one numeric namespace between them was a real bug
 * caught while testing: a paragraph with one hard break and one code
 * span produced the identical placeholder for both, so restoring one
 * clobbered the other.
 */
function renderInline(rawText, hardBreakCount = 0) {
  let text = escapeHtml(rawText);

  // Placeholder tokens are letters-and-digits only, deliberately: every
  // other character markdown treats specially (_, *, `, [, ], (, )) is
  // excluded, because an earlier version of this used underscores in its
  // placeholders and the italic regex below matched *inside its own
  // placeholder text*, corrupting it — letters+digits can't collide with
  // any inline syntax this function looks for.
  for (let index = 0; index < hardBreakCount; index++) {
    text = text.split(`QQBREAKMARKERQQ${index}QQ`).join(`QQTOKENQQBREAKQQ${index}QQENDQQ`);
  }

  const codeSpans = [];
  text = text.replace(/`([^`]+)`/g, (_match, code) => {
    codeSpans.push(`<code>${code}</code>`);
    return `QQTOKENQQCODEQQ${codeSpans.length - 1}QQENDQQ`;
  });

  // Images before links: image syntax is link syntax with a leading "!",
  // so images must be consumed first or the link pattern would match the
  // "[alt](url)" part of an image and drop the "!".
  text = text.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_m, alt, url) => `<img src="${sanitizeUrl(url)}" alt="${alt}" loading="lazy" />`);
  text = text.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, linkText, url) => `<a href="${sanitizeUrl(url)}" rel="noopener noreferrer">${linkText}</a>`);

  // Bold before italic: "**x**" would otherwise be partially consumed by
  // a "*x*" italic pattern running first.
  text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  text = text.replace(/__([^_]+)__/g, "<strong>$1</strong>");
  text = text.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  text = text.replace(/_([^_]+)_/g, "<em>$1</em>");

  text = text.replace(/QQTOKENQQCODEQQ(\d+)QQENDQQ/g, (_m, index) => codeSpans[Number(index)]);
  // The marker is wrapped in exactly one space on each side by
  // joinParagraphLines (so it survives as its own "word" through
  // escaping) — consume both here so the rendered <br /> doesn't leave
  // stray spaces behind ("here <br />\n and" instead of "here<br />\nand").
  text = text.replace(/ ?QQTOKENQQBREAKQQ(\d+)QQENDQQ ?/g, "<br />\n");

  return text;
}

/**
 * Joins a paragraph's raw source lines into one string, inserting a
 * numbered "QQBREAKMARKERQQnQQ" token wherever a line ends in a hard
 * break (trailing double-space) so `renderInline` can turn it into a real
 * `<br />` after escaping — inserting literal `<br />` here would just
 * get HTML-escaped away by `renderInline`'s first step. Must stay in sync
 * with the marker format `renderInline` searches for.
 */
function joinParagraphLines(rawLines) {
  let hardBreakCount = 0;
  const joined = rawLines
    .map((line, index) => {
      const isLast = index === rawLines.length - 1;
      const hasHardBreak = !isLast && /  $/.test(line);
      const trimmed = line.trim();
      if (hasHardBreak) {
        const marker = `${trimmed} QQBREAKMARKERQQ${hardBreakCount}QQ `;
        hardBreakCount++;
        return marker;
      }
      return isLast ? trimmed : `${trimmed} `;
    })
    .join("");
  return { joined, hardBreakCount };
}

/** @param {string} markdown @returns {string} */
export function markdownToHtml(markdown) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let paragraphLines = [];
  let list = null; // { type: "ul"|"ol", items: string[] }
  let quoteLines = [];
  let i = 0;

  function flushParagraph() {
    if (paragraphLines.length === 0) return;
    const { joined, hardBreakCount } = joinParagraphLines(paragraphLines);
    blocks.push(`<p>${renderInline(joined, hardBreakCount)}</p>`);
    paragraphLines = [];
  }
  function flushList() {
    if (!list) return;
    const items = list.items.map((item) => `<li>${renderInline(item)}</li>`).join("");
    blocks.push(`<${list.type}>${items}</${list.type}>`);
    list = null;
  }
  function flushQuote() {
    if (quoteLines.length === 0) return;
    const { joined, hardBreakCount } = joinParagraphLines(quoteLines);
    blocks.push(`<blockquote><p>${renderInline(joined, hardBreakCount)}</p></blockquote>`);
    quoteLines = [];
  }
  function flushAll() {
    flushParagraph();
    flushList();
    flushQuote();
  }

  while (i < lines.length) {
    const line = lines[i];

    const fence = line.match(/^```\s*(\S*)\s*$/);
    if (fence) {
      flushAll();
      const language = fence[1];
      const codeLines = [];
      i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip the closing fence
      const classAttr = language ? ` class="language-${escapeHtml(language)}"` : "";
      blocks.push(`<pre><code${classAttr}>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.+?)\s*#*\s*$/);
    if (heading) {
      flushAll();
      const level = heading[1].length;
      blocks.push(`<h${level}>${renderInline(heading[2])}</h${level}>`);
      i++;
      continue;
    }

    if (/^(?:-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
      flushAll();
      blocks.push("<hr />");
      i++;
      continue;
    }

    const quote = line.match(/^>\s?(.*)$/);
    if (quote) {
      flushParagraph();
      flushList();
      quoteLines.push(quote[1]);
      i++;
      continue;
    }
    if (quoteLines.length > 0) flushQuote();

    const ulItem = line.match(/^[-*+]\s+(.+)$/);
    if (ulItem) {
      flushParagraph();
      flushQuote();
      if (!list || list.type !== "ul") {
        flushList();
        list = { type: "ul", items: [] };
      }
      list.items.push(ulItem[1]);
      i++;
      continue;
    }

    const olItem = line.match(/^\d+\.\s+(.+)$/);
    if (olItem) {
      flushParagraph();
      flushQuote();
      if (!list || list.type !== "ol") {
        flushList();
        list = { type: "ol", items: [] };
      }
      list.items.push(olItem[1]);
      i++;
      continue;
    }
    if (list) flushList();

    if (line.trim() === "") {
      flushAll();
      i++;
      continue;
    }

    paragraphLines.push(line);
    i++;
  }
  flushAll();

  return blocks.join("\n");
}
