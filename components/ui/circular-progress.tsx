import * as React from "react";
import clsx from "clsx";

type CircularProgressProps = {
  children?: React.ReactNode;
  className?: string;
  color?: string;
  size?: number;
  strokeWidth?: number;
  value: number;
};

export function CircularProgress({
  children,
  className,
  color = "var(--accent)",
  size = 120,
  strokeWidth = 8,
  value,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const safeValue = Math.max(0, Math.min(100, value));
  const offset = circumference - (safeValue / 100) * circumference;

  return (
    <div
      className={clsx("relative grid shrink-0 place-items-center", className)}
      style={{ height: size, width: size }}
    >
      <svg
        aria-hidden="true"
        className="h-full w-full -rotate-90"
        viewBox={`0 0 ${size} ${size}`}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          fill="none"
          r={radius}
          stroke="var(--bg-muted)"
          strokeWidth={strokeWidth}
        />
        <circle
          className="ring-track"
          cx={size / 2}
          cy={size / 2}
          fill="none"
          r={radius}
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          strokeWidth={strokeWidth}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        {children}
      </div>
    </div>
  );
}
