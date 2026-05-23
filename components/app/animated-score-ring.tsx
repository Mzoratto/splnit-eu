"use client";

import { useMemo } from "react";
import { CircularProgress } from "@/components/ui/circular-progress";

export function AnimatedScoreRing({
  label = "Score",
  locale = "en-EU",
  score,
}: {
  label?: string;
  locale?: string;
  score: number;
}) {
  const safeScore = Math.max(0, Math.min(100, score));
  const formatter = useMemo(() => new Intl.NumberFormat(locale), [locale]);

  return (
    <CircularProgress value={safeScore}>
      <div className="text-center">
        <p className="font-mono text-[32px] font-semibold leading-none text-foreground">
          {formatter.format(safeScore)}%
        </p>
        <p className="mt-1 text-[11px] font-medium uppercase text-foreground/52">{label}</p>
      </div>
    </CircularProgress>
  );
}
