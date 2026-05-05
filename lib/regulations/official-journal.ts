const ENTITY_MAP: Record<string, string> = {
  amp: "&",
  apos: "'",
  gt: ">",
  lt: "<",
  nbsp: " ",
  quot: '"',
};

function decodeEntity(entity: string) {
  if (entity.startsWith("#x")) {
    const codePoint = Number.parseInt(entity.slice(2), 16);
    return Number.isNaN(codePoint) ? `&${entity};` : String.fromCodePoint(codePoint);
  }

  if (entity.startsWith("#")) {
    const codePoint = Number.parseInt(entity.slice(1), 10);
    return Number.isNaN(codePoint) ? `&${entity};` : String.fromCodePoint(codePoint);
  }

  return ENTITY_MAP[entity] ?? `&${entity};`;
}

function decodeHtml(value: string) {
  return value.replace(/&([a-zA-Z]+|#\d+|#x[0-9a-fA-F]+);/g, (_, entity: string) =>
    decodeEntity(entity),
  );
}

function stripHtml(value: string) {
  return decodeHtml(value)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/tr>/gi, "\n")
    .replace(/<[^>]*>/g, " ")
    .replace(/[ \t\r\f\v]+/g, " ")
    .replace(/\n\s+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function normalizeArticleId(articleId: string) {
  const numeric = articleId.replace(/^art_?/i, "").padStart(2, "0");
  return `art_${numeric}`;
}

function getArticleSection(xhtml: string, articleId: string) {
  const normalizedId = normalizeArticleId(articleId);
  const startPattern = new RegExp(
    `<div\\s+class="eli-subdivision"\\s+id="${normalizedId}">`,
  );
  const startMatch = startPattern.exec(xhtml);

  if (!startMatch) {
    throw new Error(`Could not find Official Journal article section ${normalizedId}.`);
  }

  const start = startMatch.index;
  const nextSection = xhtml
    .slice(start + startMatch[0].length)
    .search(/<div\s+class="eli-subdivision"\s+id="art_\d+">/);
  const end =
    nextSection === -1 ? xhtml.length : start + startMatch[0].length + nextSection;

  return xhtml.slice(start, end);
}

function getArticleTitle(sectionHtml: string) {
  const titleMatch = sectionHtml.match(
    /<div\s+class="eli-title"[\s\S]*?<p[^>]*class="oj-sti-art"[^>]*>([\s\S]*?)<\/p>/,
  );

  return titleMatch ? stripHtml(titleMatch[1]) : null;
}

export function extractOfficialJournalArticle(xhtml: string, articleId: string) {
  const sectionHtml = getArticleSection(xhtml, articleId);
  const title = getArticleTitle(sectionHtml);

  return {
    articleKey: `Article ${Number.parseInt(articleId.replace(/\D/g, ""), 10)}`,
    officialText: stripHtml(sectionHtml),
    title,
  };
}
