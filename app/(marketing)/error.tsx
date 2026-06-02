"use client";

export default function MarketingError({ reset }: { reset: () => void }) {
  return (
    <main className="min-h-[60vh] bg-surface px-6 py-16 text-foreground">
      <div className="mx-auto max-w-2xl rounded-lg border border-border bg-[var(--surface-raised)] p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-foreground/60">Dočasný problém</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">Stránku se nepodařilo načíst.</h1>
        <p className="mt-3 text-sm leading-6 text-foreground/70">
          Zkuste obnovit obsah. Interní detaily chyby nezobrazujeme veřejně.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--accent-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2"
        >
          Zkusit znovu
        </button>
      </div>
    </main>
  );
}
