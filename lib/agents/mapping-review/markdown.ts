export const REVIEW_DECISIONS = [
  "approved",
  "wrong_article",
  "too_broad",
  "needs_research",
] as const;

export type ReviewDecision = (typeof REVIEW_DECISIONS)[number];

export type MappingReviewMarkdownRow = {
  articleCitation: string;
  control: string;
  evidenceRequirement: string;
  lineNumber: number;
  mappingId: string;
  mappingNote: string;
  reviewerDecision: ReviewDecision | null;
  reviewerNote: string;
  source: string;
};

export function splitMarkdownRow(line: string) {
  const trimmed = line.trim();

  if (!trimmed.startsWith("|") || !trimmed.endsWith("|")) {
    return null;
  }

  const cells: string[] = [];
  let current = "";

  for (let index = 1; index < trimmed.length - 1; index += 1) {
    const char = trimmed[index];
    const next = trimmed[index + 1];

    if (char === "\\" && next === "|") {
      current += "|";
      index += 1;
      continue;
    }

    if (char === "|") {
      cells.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  cells.push(current.trim());
  return cells;
}

export function parseMappingReviewMarkdown(markdown: string) {
  const rows: MappingReviewMarkdownRow[] = [];
  let inMappingTable = false;

  markdown.split("\n").forEach((line, index) => {
    if (line.startsWith("| Mapping ID |")) {
      inMappingTable = true;
      return;
    }

    if (!inMappingTable || line.startsWith("| ---")) {
      return;
    }

    if (line.startsWith("## ")) {
      inMappingTable = false;
      return;
    }

    if (!line.trim()) {
      return;
    }

    const cells = splitMarkdownRow(line);

    if (!cells) {
      return;
    }

    if (cells.length !== 9) {
      throw new Error(
        `Malformed review row at line ${index + 1}: expected 9 columns, got ${cells.length}.`,
      );
    }

    const mappingId = cells[0].trim();

    if (!/^[0-9a-f-]{36}$/i.test(mappingId)) {
      throw new Error(`Invalid mapping ID at line ${index + 1}: ${mappingId}`);
    }

    const rawDecision = cells[7].trim().toLowerCase();
    const reviewerDecision = rawDecision
      ? parseReviewDecision(rawDecision, index + 1)
      : null;

    rows.push({
      articleCitation: cells[4].trim(),
      control: cells[1].trim(),
      evidenceRequirement: cells[6].trim(),
      lineNumber: index + 1,
      mappingId,
      mappingNote: cells[5].trim(),
      reviewerDecision,
      reviewerNote: cells[8].trim(),
      source: cells[3].trim(),
    });
  });

  return rows;
}

function parseReviewDecision(value: string, lineNumber: number): ReviewDecision {
  if (REVIEW_DECISIONS.includes(value as ReviewDecision)) {
    return value as ReviewDecision;
  }

  throw new Error(`Invalid reviewer decision at line ${lineNumber}: ${value}`);
}
