/**
 * Normalizes HTML from external paste sources (Facebook, Word, etc.) before ProseMirror parses it.
 * Reduces "double spacing" caused by one block element per line.
 */

const BLOCK_TAGS =
  "P,H1,H2,H3,H4,H5,H6,UL,OL,BLOCKQUOTE,PRE,TABLE,HR,ADDRESS,ARTICLE,SECTION,ASIDE,NAV,MAIN,FIGURE";

function isOnlyInlineStructure(el: Element): boolean {
  return !el.querySelector(BLOCK_TAGS);
}

/**
 * Merge consecutive top-level divs that are plain "one line per div" (Facebook-style) into one &lt;p&gt;.
 */
function mergeAdjacentSoftDivs(container: HTMLElement, doc: Document): void {
  const children = Array.from(container.children);
  if (children.length < 2) return;

  const allSoftLineDivs = children.every(
    (el) => el.tagName === "DIV" && isOnlyInlineStructure(el)
  );

  if (!allSoftLineDivs) return;

  const p = doc.createElement("p");
  children.forEach((div, index) => {
    if (index > 0) p.appendChild(doc.createElement("br"));
    while (div.firstChild) {
      p.appendChild(div.firstChild);
    }
  });
  container.replaceChildren(p);
}

function stripWordNoise(root: HTMLElement): void {
  root.querySelectorAll("[class]").forEach((el) => {
    const c = el.getAttribute("class") ?? "";
    if (/Mso|Word|msonormal/i.test(c)) {
      el.removeAttribute("class");
    }
  });
}

function removeEmptyParagraphs(root: HTMLElement): void {
  root.querySelectorAll("p").forEach((p) => {
    const normalized = p.innerHTML
      .replace(/\s|&nbsp;/gi, "")
      .replace(/<br\s*\/?>/gi, "");
    if (normalized.length === 0) {
      p.remove();
    }
  });
}

function collapseBrRuns(html: string): string {
  return html.replace(/(?:\s*<br\s*\/?>\s*){3,}/gi, "<br><br>");
}

/**
 * Repeatedly flatten leaf divs: either become &lt;p&gt; (inline-only) or unwrap when they only wrap blocks.
 */
function flattenDivs(root: HTMLElement, doc: Document): void {
  let guard = 0;
  while (guard++ < 50) {
    const leafDivs = Array.from(root.querySelectorAll("div")).filter(
      (d) => !d.closest("li, td, th") && !d.querySelector("div")
    );
    if (leafDivs.length === 0) break;

    for (const div of leafDivs) {
      const kids = Array.from(div.children);
      const hasBlockChild = kids.some((c) =>
        new Set(BLOCK_TAGS.split(",").map((t) => t.trim())).has(c.tagName)
      );

      if (hasBlockChild) {
        div.replaceWith(...Array.from(div.childNodes));
      } else {
        const p = doc.createElement("p");
        p.innerHTML = div.innerHTML;
        div.replaceWith(p);
      }
    }
  }
}

/**
 * Transforms clipboard HTML so Tiptap/ProseMirror produce tighter, more natural paragraphs.
 */
export function sanitizePastedHtml(html: string): string {
  if (!html || typeof document === "undefined") return html;

  let trimmed = html
    .replace(/^\s*<\?xml[^>]*>\s*/i, "")
    .replace(/<meta[^>]*>/gi, "");

  trimmed = collapseBrRuns(trimmed);

  try {
    const doc = new DOMParser().parseFromString(
      `<div id="__paste_root">${trimmed}</div>`,
      "text/html"
    );
    const root = doc.getElementById("__paste_root");
    if (!root) return trimmed;

    stripWordNoise(root);
    mergeAdjacentSoftDivs(root, doc);
    flattenDivs(root, doc);
    removeEmptyParagraphs(root);

    let inner = root.innerHTML;
    inner = collapseBrRuns(inner);

    return inner;
  } catch {
    return trimmed;
  }
}
