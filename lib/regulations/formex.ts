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

    return Number.isNaN(codePoint)
      ? `&${entity};`
      : String.fromCodePoint(codePoint);
  }

  if (entity.startsWith("#")) {
    const codePoint = Number.parseInt(entity.slice(1), 10);

    return Number.isNaN(codePoint)
      ? `&${entity};`
      : String.fromCodePoint(codePoint);
  }

  return ENTITY_MAP[entity] ?? `&${entity};`;
}

function decodeXml(value: string) {
  return value.replace(/&([a-zA-Z]+|#\d+|#x[0-9a-fA-F]+);/g, (_, entity: string) =>
    decodeEntity(entity),
  );
}

function stripFormexXml(value: string) {
  return decodeXml(value)
    .replace(/<\?PAGE\b[^?]*\?>/g, "\n")
    .replace(/<\/(TI\.ART|STI\.ART|PARAG|ALINEA|P|TXT|NP|ITEM|LIST)>/g, "\n")
    .replace(/<NO\.PARAG\b[^>]*>/g, "\n")
    .replace(/<NO\.P\b[^>]*>/g, "\n")
    .replace(/<[^>]*>/g, " ")
    .replace(/[ \t\r\f\v]+/g, " ")
    .replace(/\n\s+/g, "\n")
    .replace(/[ \t]+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function extractTitle(sectionXml: string) {
  const match = sectionXml.match(/<STI\.ART\b[^>]*>([\s\S]*?)<\/STI\.ART>/);

  return match ? stripFormexXml(match[1]) : null;
}

export type ExtractedFormexArticle = {
  articleKey: string;
  articleNumber: number;
  officialText: string;
  title: string | null;
};

export function extractFormexArticles(xml: string) {
  const matches = Array.from(
    xml.matchAll(/<ARTICLE\b[^>]*IDENTIFIER="(\d{3})"[^>]*>[\s\S]*?<\/ARTICLE>/g),
  );

  return matches.map((match): ExtractedFormexArticle => {
    const articleNumber = Number.parseInt(match[1] ?? "", 10);
    const sectionXml = match[0];

    if (!Number.isInteger(articleNumber)) {
      throw new Error(`Invalid Formex article identifier ${match[1] ?? "unknown"}.`);
    }

    return {
      articleKey: `Article ${articleNumber}`,
      articleNumber,
      officialText: stripFormexXml(sectionXml),
      title: extractTitle(sectionXml),
    };
  });
}
