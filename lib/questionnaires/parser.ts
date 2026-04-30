export function parseQuestionnaireText(input: string) {
  const text = input.replace(/\r/g, "\n").replace(/\n{3,}/g, "\n\n").trim();

  if (!text) {
    return [];
  }

  const directLines = text
    .split("\n")
    .map((line) => line.replace(/^\s*(?:\d+[\).:-]?|[-*•])\s*/, "").trim())
    .filter((line) => line.length > 8);

  if (directLines.length >= 2) {
    return directLines.slice(0, 80);
  }

  return text
    .split(/(?<=\?)\s+/)
    .map((question) => question.trim())
    .filter((question) => question.length > 8)
    .slice(0, 80);
}

export function truncateQuestionnaireText(input: string) {
  return input.slice(0, 40_000);
}
