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

  const relevantRows = input.statusRows.filter(
    (row) => row.status !== "not_applicable" && row.status !== "out_of_scope",
  );

  if (relevantRows.length === 0) {
    return 0;
  }

  const passing = relevantRows.filter((row) => row.status === "pass").length;
  return Math.round((passing / relevantRows.length) * 100);
}
