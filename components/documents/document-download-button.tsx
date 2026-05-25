"use client";

import { useState } from "react";
import { FileSpreadsheet, Loader2 } from "lucide-react";

type DocumentDownloadButtonProps = {
  className?: string;
  href: string;
  label: string;
};

function filenameFromDisposition(disposition: string | null) {
  const match = disposition?.match(/filename="([^"]+)"/);

  return match?.[1] ?? null;
}

export function DocumentDownloadButton({
  className = "btn btn-secondary",
  href,
  label,
}: DocumentDownloadButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function downloadDocument() {
    if (isLoading) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(href);

      if (!response.ok) {
        const body = await response.json().catch(() => null) as { error?: string } | null;
        throw new Error(body?.error ?? "Dokument se nepodařilo vygenerovat.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download =
        filenameFromDisposition(response.headers.get("Content-Disposition")) ??
        "compliance-document.xlsx";
      document.body.append(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (downloadError) {
      setError(
        downloadError instanceof Error
          ? downloadError.message
          : "Dokument se nepodařilo vygenerovat.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={downloadDocument}
        disabled={isLoading}
        className={`${className} disabled:cursor-not-allowed disabled:opacity-50`}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" strokeWidth={1.7} />
        ) : (
          <FileSpreadsheet className="h-4 w-4" aria-hidden="true" strokeWidth={1.7} />
        )}
        {isLoading ? "Generuji..." : label}
      </button>
      {error ? <p className="text-xs leading-5 text-status-fail">{error}</p> : null}
    </div>
  );
}
