import type { FrameworkSeed } from "@/lib/frameworks/registry";

export type PublicTrustFramework = {
  framework: FrameworkSeed;
  score: number | null;
  status: string;
};

export function getTrustCenterSummary(frameworks: PublicTrustFramework[]) {
  const visibleScores = frameworks
    .map((item) => item.score)
    .filter((score): score is number => typeof score === "number");

  const averageScore =
    visibleScores.length === 0
      ? null
      : Math.round(
          visibleScores.reduce((total, score) => total + score, 0) /
            visibleScores.length,
        );

  return {
    frameworkCount: frameworks.length,
    averageScore,
    updatedAt: new Date().toISOString(),
  };
}
