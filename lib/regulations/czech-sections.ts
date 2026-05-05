function normalizeWhitespace(value: string) {
  return value
    .replace(/\r/g, "")
    .replace(/\f/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function sectionStartRegex(sectionNumber: number) {
  return new RegExp(`^\\s*§\\s*${sectionNumber}\\s*$`, "m");
}

function nextSectionRegex() {
  return /^\s*§\s*\d+\s*$/m;
}

export function extractCzechSection(text: string, sectionNumber: number) {
  const normalizedText = normalizeWhitespace(text);
  const startMatch = sectionStartRegex(sectionNumber).exec(normalizedText);

  if (!startMatch) {
    throw new Error(`Could not find Czech section § ${sectionNumber}.`);
  }

  const start = startMatch.index;
  const afterStart = normalizedText.slice(start + startMatch[0].length);
  const endMatch = nextSectionRegex().exec(afterStart);
  const end = endMatch
    ? start + startMatch[0].length + endMatch.index
    : normalizedText.length;
  const sectionText = normalizeWhitespace(normalizedText.slice(start, end));
  const lines = sectionText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return {
    articleKey: `§ ${sectionNumber}`,
    officialText: sectionText,
    title: lines.find((line) => !line.startsWith("§")) ?? null,
  };
}
