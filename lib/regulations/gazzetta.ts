const ENTITY_MAP: Record<string, string> = {
  amp: "&",
  apos: "'",
  egrave: "e'",
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
    .replace(/<[^>]*>/g, " ")
    .replace(/\r/g, "")
    .replace(/[ \t\f\v]+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function extractPreText(html: string) {
  const match = html.match(/<span[^>]*class="dettaglio_atto_testo"[\s\S]*?<pre>([\s\S]*?)<\/pre>/);

  if (!match?.[1]) {
    throw new Error("Could not find Gazzetta article text block.");
  }

  return stripHtml(match[1]);
}

function extractArticleTitle(officialText: string) {
  const lines = officialText.split("\n").map((line) => line.trim());
  const articleLineIndex = lines.findIndex((line) => /^Art\.\s+\d+/.test(line));

  if (articleLineIndex === -1) {
    return null;
  }

  const titleLines: string[] = [];

  for (const line of lines.slice(articleLineIndex + 1)) {
    if (!line) {
      continue;
    }

    if (/^\d+\./.test(line)) {
      break;
    }

    titleLines.push(line);
  }

  return titleLines.length > 0 ? titleLines.join(" ").replace(/\s+/g, " ") : null;
}

export function buildGazzettaArticleUrl(articleId: number, groupId: number) {
  const params = new URLSearchParams({
    "art.codiceRedazionale": "24G00155",
    "art.dataPubblicazioneGazzetta": "2024-10-01",
    "art.flagTipoArticolo": "0",
    "art.idArticolo": String(articleId),
    "art.idGruppo": String(groupId),
    "art.idSottoArticolo": "1",
    "art.idSottoArticolo1": "10",
    "art.progressivo": "0",
    "art.versione": "1",
  });

  return `https://www.gazzettaufficiale.it/atto/serie_generale/caricaArticolo?${params.toString()}#art`;
}

export function extractGazzettaArticle(html: string, articleId: number) {
  const officialText = extractPreText(html);

  if (!officialText.includes(`Art. ${articleId}`)) {
    throw new Error(`Gazzetta article text does not contain Art. ${articleId}.`);
  }

  return {
    articleKey: `Art. ${articleId}`,
    officialText,
    title: extractArticleTitle(officialText),
  };
}
