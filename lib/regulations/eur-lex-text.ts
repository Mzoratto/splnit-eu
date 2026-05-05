function normalizeLine(value: string) {
  return value.normalize("NFKC").replace(/\s+/g, " ").trim();
}

function isArticleHeading(line: string, articleId: string) {
  return new RegExp(`^Article\\s+${articleId}$`, "i").test(normalizeLine(line));
}

function isAnyArticleHeading(line: string) {
  return /^Article\s+\d+[a-z]?$/i.test(normalizeLine(line));
}

function trimArticleText(lines: string[]) {
  return lines
    .join("\n")
    .replace(/\r/g, "")
    .replace(/[ \t\f\v]+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function extractTitle(articleLines: string[]) {
  const titleLines: string[] = [];

  for (const line of articleLines.slice(1)) {
    const normalized = normalizeLine(line);

    if (!normalized) {
      continue;
    }

    if (/^\d+[.)]/.test(normalized)) {
      break;
    }

    titleLines.push(normalized);
  }

  return titleLines.length > 0 ? titleLines.join(" ") : null;
}

export function extractEurLexArticleText(text: string, articleId: string) {
  const lines = text.split("\n");
  const startIndex = lines.findIndex((line) => isArticleHeading(line, articleId));

  if (startIndex === -1) {
    throw new Error(`Could not find EUR-Lex Article ${articleId} in source text.`);
  }

  const nextIndex = lines.findIndex(
    (line, index) => index > startIndex && isAnyArticleHeading(line),
  );
  const articleLines = lines.slice(startIndex, nextIndex === -1 ? undefined : nextIndex);
  const articleNumber = Number.parseInt(articleId.replace(/\D/g, ""), 10);

  return {
    articleKey: `Article ${articleNumber}`,
    officialText: trimArticleText(articleLines),
    title: extractTitle(articleLines),
  };
}
