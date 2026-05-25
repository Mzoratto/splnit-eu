"use client";

import { useState } from "react";
import { Clock, FileDown, FileText, Loader2 } from "lucide-react";
import type { ComplianceTemplate } from "@/lib/marketing/templates";

type TemplateCardProps = {
  template: ComplianceTemplate;
};

function filenameFromPath(filePath: string) {
  return decodeURIComponent(filePath.split("/").pop() ?? "template");
}

export function TemplateCard({ template }: TemplateCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formatLabel = template.format.toUpperCase();
  const canDownload = template.status === "available" && Boolean(template.filePath);

  async function downloadTemplate() {
    if (!template.filePath || isLoading) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(template.filePath);

      if (!response.ok) {
        throw new Error("Soubor se nepodařilo stáhnout.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = filenameFromPath(template.filePath);
      document.body.append(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (downloadError) {
      setError(
        downloadError instanceof Error
          ? downloadError.message
          : "Soubor se nepodařilo stáhnout.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <article className="card flex h-full flex-col">
      <div className="flex items-center justify-between gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-surface-muted text-primary">
          <FileText className="h-5 w-5" aria-hidden="true" strokeWidth={1.5} />
        </span>
        <span className="rounded-full border border-border-default bg-surface-muted px-3 py-1 font-mono text-xs font-medium text-foreground/64">
          {formatLabel}
        </span>
      </div>

      <div className="mt-5 grow">
        <h3 className="text-lg font-medium">{template.title}</h3>
        <p className="mt-3 text-sm leading-6 text-foreground/64">
          {template.description}
        </p>
      </div>

      <div className="mt-6">
        {canDownload ? (
          <button
            type="button"
            className="btn btn-primary w-full"
            disabled={isLoading}
            onClick={downloadTemplate}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" strokeWidth={1.5} />
            ) : (
              <FileDown className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
            )}
            {isLoading ? "Stahuji..." : `Stáhnout ${formatLabel}`}
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-secondary w-full cursor-not-allowed opacity-60"
            disabled
          >
            <Clock className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
            Připravujeme
          </button>
        )}
        {error ? <p className="mt-2 text-xs leading-5 text-status-fail">{error}</p> : null}
      </div>
    </article>
  );
}
