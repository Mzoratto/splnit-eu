"use client";

import { useEffect, useMemo, useState } from "react";

export function AnimatedScoreRing({
  label = "Score",
  locale = "en-EU",
  score,
}: {
  label?: string;
  locale?: string;
  score: number;
}) {
  const [displayScore, setDisplayScore] = useState(0);
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const safeScore = Math.max(0, Math.min(100, score));
  const offset = circumference - (safeScore / 100) * circumference;
  const formatter = useMemo(() => new Intl.NumberFormat(locale), [locale]);

  useEffect(() => {
    let frame = 0;
    let start: number | null = null;
    const duration = 1400;

    const tick = (timestamp: number) => {
      if (start === null) {
        start = timestamp;
      }

      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(safeScore * eased));

      if (progress < 1) {
        frame = window.requestAnimationFrame(tick);
      }
    };

    frame = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(frame);
  }, [safeScore]);

  return (
    <div className="relative h-[120px] w-[120px]">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          fill="none"
          r={radius}
          stroke="var(--border-subtle)"
          strokeWidth="8"
        />
        <circle
          cx="60"
          cy="60"
          fill="none"
          r={radius}
          stroke="var(--accent)"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          strokeWidth="8"
          className="ring-track"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <p className="font-mono text-[32px] font-semibold leading-none text-foreground">
            {formatter.format(displayScore)}%
          </p>
          <p className="mt-1 text-[11px] text-foreground/52">{label}</p>
        </div>
      </div>
    </div>
  );
}
