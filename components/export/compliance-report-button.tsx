"use client";

import Link from "next/link";
import { useState } from "react";
import { Download, Loader2 } from "lucide-react";

type ComplianceReportButtonProps = {
  missingFields: string[];
  orgId: string;
};

function filenameFromDisposition(disposition: string | null) {
  const match = disposition?.match(/filename="([^"]+)"/);

  return match?.[1] ?? "zprava-kyberneticka-bezpecnost.pdf";
}

export function ComplianceReportButton({
  missingFields,
  orgId,
}: ComplianceReportButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isDisabled = missingFields.length > 0 || isLoading;
  const disabledTooltip = missingFields.length
    ? `Před exportem vyplňte: ${missingFields.join(", ")}`
    : undefined;

  async function downloadReport() {
    if (isDisabled) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/export/compliance-report?orgId=${encodeURIComponent(orgId)}`,
      );

      if (!response.ok) {
        const body = await response.json().catch(() => null) as { error?: string } | null;
        throw new Error(body?.error ?? "Zprávu se nepodařilo připravit.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = filenameFromDisposition(response.headers.get("Content-Disposition"));
      document.body.append(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (downloadError) {
      setError(
        downloadError instanceof Error
          ? downloadError.message
          : "Zprávu se nepodařilo připravit.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <span title={disabledTooltip}>
        <button
          type="button"
          className="btn btn-primary w-full justify-center sm:w-auto"
          disabled={isDisabled}
          onClick={downloadReport}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" strokeWidth={1.7} />
          ) : (
            <Download className="h-4 w-4" aria-hidden="true" strokeWidth={1.7} />
          )}
          {isLoading ? "Připravuji PDF..." : "Stáhnout zprávu o shodě (PDF)"}
        </button>
      </span>

      {missingFields.length > 0 ? (
        <p className="text-xs leading-5 text-foreground/58">
          Před exportem vyplňte: {missingFields.join(", ")}.{" "}
          <Link href="/settings/profile" className="font-medium text-primary hover:underline">
            Upravit profil společnosti
          </Link>
        </p>
      ) : null}

      {error ? <p className="text-xs leading-5 text-status-fail">{error}</p> : null}
    </div>
  );
}
