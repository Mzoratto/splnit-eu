import { AlertTriangle } from "lucide-react";

type DataModeNoticeProps = {
  body: string;
  title: string;
  tone?: "neutral" | "warn";
};

export function DataModeNotice({
  body,
  title,
  tone = "warn",
}: DataModeNoticeProps) {
  const className =
    tone === "warn"
      ? "border-[var(--status-warn-border)] bg-[var(--status-warn-subtle)] text-[var(--status-warn)]"
      : "border-border bg-surface-muted text-foreground/72";

  return (
    <aside className={`rounded-lg border px-4 py-3 text-sm ${className}`}>
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <div>
          <p className="font-medium">{title}</p>
          <p className="mt-1 leading-6">{body}</p>
        </div>
      </div>
    </aside>
  );
}
