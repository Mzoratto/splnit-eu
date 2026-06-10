import { calculateWeightedControlScore } from "@/lib/controls/scorer";

export function calculateComplianceScore(input: {
  frameworkScores: { score: number | null }[];
  statusRows: { status: string }[];
}) {
  const explicitScores = input.frameworkScores
    .map((item) => item.score)
    .filter((score): score is number => typeof score === "number");

  if (explicitScores.length > 0) {
    return Math.round(
      explicitScores.reduce((total, score) => total + score, 0) /
        explicitScores.length,
    );
  }

  return calculateWeightedControlScore(
    input.statusRows.map((row) => row.status),
    { emptyScore: 0 },
  );
}
