"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <section className="grid min-h-[60vh] place-items-center px-5">
      <div className="max-w-md rounded-lg border border-border bg-surface p-6 text-center">
        <p className="text-sm font-medium uppercase tracking-[0.14em] text-danger">
          Chyba aplikace
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-normal">
          Něco se nepodařilo načíst
        </h1>
        <p className="mt-3 text-sm leading-6 text-foreground/64">
          Událost byla zaznamenána. Zkuste stránku obnovit, nebo se vraťte do dashboardu.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground"
        >
          Zkusit znovu
        </button>
      </div>
    </section>
  );
}
