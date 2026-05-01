import clsx from "clsx";

export type StatusPillTone = "pass" | "warn" | "fail" | "neutral";

type StatusPillProps = {
  children: React.ReactNode;
  className?: string;
  tone: StatusPillTone;
};

export function StatusPill({ children, className, tone }: StatusPillProps) {
  return (
    <span className={clsx("status-pill", `status-pill--${tone}`, className)}>
      {children}
    </span>
  );
}
