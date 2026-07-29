import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { markdownToHtml } from "../../tools/markdown-to-html-converter/logic.js";

describe("markdownToHtml — headings", () => {
  test("renders h1 through h6", () => {
    for (let level = 1; level <= 6; level++) {
      const html = markdownToHtml(`${"#".repeat(level)} Title`);
      assert.equal(html, `<h${level}>Title</h${level}>`);
    }
  });
  test("strips trailing closing hashes (# Title #)", () => {
    assert.equal(markdownToHtml("## Title ##"), "<h2>Title</h2>");
  });
});

describe("markdownToHtml — paragraphs and inline formatting", () => {
  test("wraps plain text in a paragraph", () => {
    assert.equal(markdownToHtml("Hello world"), "<p>Hello world</p>");
  });
  test("joins consecutive lines into one paragraph", () => {
    assert.equal(markdownToHtml("Line one\nLine two"), "<p>Line one Line two</p>");
  });
  test("bold with ** and __", () => {
    assert.equal(markdownToHtml("**bold**"), "<p><strong>bold</strong></p>");
    assert.equal(markdownToHtml("__bold__"), "<p><strong>bold</strong></p>");
  });
  test("italic with * and _", () => {
    assert.equal(markdownToHtml("*italic*"), "<p><em>italic</em></p>");
    assert.equal(markdownToHtml("_italic_"), "<p><em>italic</em></p>");
  });
  test("bold and italic together don't get mangled", () => {
    assert.equal(markdownToHtml("**bold** and *italic*"), "<p><strong>bold</strong> and <em>italic</em></p>");
  });
  test("inline code", () => {
    assert.equal(markdownToHtml("Use `npm install`"), "<p>Use <code>npm install</code></p>");
  });
  test("markdown syntax inside inline code is not processed", () => {
    assert.equal(markdownToHtml("`**not bold**`"), "<p><code>**not bold**</code></p>");
  });
  test("a hard line break (trailing double-space)", () => {
    assert.equal(markdownToHtml("line one  \nline two"), "<p>line one<br />\nline two</p>");
  });
  test("a hard line break alongside a code span in the same paragraph doesn't corrupt either", () => {
    // Regression test for a real bug: code-span and hard-break placeholders
    // originally shared one numeric namespace and could collide.
    const html = markdownToHtml("use `code` here  \nand more `code` there");
    assert.equal(html, "<p>use <code>code</code> here<br />\nand more <code>code</code> there</p>");
  });
});

describe("markdownToHtml — links and images", () => {
  test("a link", () => {
    assert.equal(
      markdownToHtml("[ToolHub](https://example.com)"),
      '<p><a href="https://example.com" rel="noopener noreferrer">ToolHub</a></p>'
    );
  });
  test("an image", () => {
    assert.equal(markdownToHtml("![alt text](https://example.com/img.png)"), '<p><img src="https://example.com/img.png" alt="alt text" loading="lazy" /></p>');
  });
  test("rejects a javascript: URL in a link", () => {
    const html = markdownToHtml("[click me](javascript:alert(1))");
    assert.doesNotMatch(html, /javascript:/);
    assert.match(html, /href="#"/);
  });
});

describe("markdownToHtml — security: raw HTML is always escaped", () => {
  test("a script tag never survives into the output as live markup", () => {
    const html = markdownToHtml("<script>alert('xss')</script>");
    assert.doesNotMatch(html, /<script>/);
    assert.match(html, /&lt;script&gt;/);
  });
  test("an inline HTML event handler attribute is escaped, not executed", () => {
    const html = markdownToHtml('<img src=x onerror="alert(1)">');
    assert.doesNotMatch(html, /<img src=x/);
    assert.match(html, /&lt;img/);
  });
  test("escaping still applies inside a heading", () => {
    const html = markdownToHtml("# <script>bad()</script>");
    assert.doesNotMatch(html, /<script>/);
  });
});

describe("markdownToHtml — lists", () => {
  test("an unordered list with -, *, or +", () => {
    assert.equal(markdownToHtml("- a\n- b"), "<ul><li>a</li><li>b</li></ul>");
    assert.equal(markdownToHtml("* a\n* b"), "<ul><li>a</li><li>b</li></ul>");
  });
  test("an ordered list", () => {
    assert.equal(markdownToHtml("1. first\n2. second"), "<ol><li>first</li><li>second</li></ol>");
  });
  test("inline formatting works inside list items", () => {
    assert.equal(markdownToHtml("- **bold** item"), "<ul><li><strong>bold</strong> item</li></ul>");
  });
});

describe("markdownToHtml — blockquotes, code blocks, hr", () => {
  test("a blockquote", () => {
    assert.equal(markdownToHtml("> quoted text"), "<blockquote><p>quoted text</p></blockquote>");
  });
  test("a fenced code block preserves whitespace and escapes content", () => {
    const html = markdownToHtml("```\nconst x = 1;\nif (x < 2) {}\n```");
    assert.equal(html, "<pre><code>const x = 1;\nif (x &lt; 2) {}</code></pre>");
  });
  test("a fenced code block with a language tag gets a language-x class", () => {
    const html = markdownToHtml("```js\nconst x = 1;\n```");
    assert.match(html, /<code class="language-js">/);
  });
  test("markdown syntax inside a code block is not processed", () => {
    const html = markdownToHtml("```\n**not bold**\n```");
    assert.match(html, /\*\*not bold\*\*/);
  });
  test("a horizontal rule", () => {
    assert.equal(markdownToHtml("---"), "<hr />");
    assert.equal(markdownToHtml("***"), "<hr />");
  });
});

describe("markdownToHtml — block separation", () => {
  test("a blank line separates two paragraphs", () => {
    assert.equal(markdownToHtml("First\n\nSecond"), "<p>First</p>\n<p>Second</p>");
  });
  test("a heading ends the preceding paragraph", () => {
    assert.equal(markdownToHtml("Some text\n# Heading"), "<p>Some text</p>\n<h1>Heading</h1>");
  });
  test("empty input produces empty output", () => {
    assert.equal(markdownToHtml(""), "");
  });
});
