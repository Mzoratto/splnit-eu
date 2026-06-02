import Link from "next/link";

export default function MarketingNotFound() {
  return (
    <main className="min-h-[60vh] bg-surface px-6 py-16 text-foreground">
      <div className="mx-auto max-w-2xl rounded-lg border border-border bg-[var(--surface-raised)] p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-foreground/60">404</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">Stránka neexistuje.</h1>
        <p className="mt-3 text-sm leading-6 text-foreground/70">
          Tato adresa není dostupná. Vraťte se na hlavní stránku Splnit.eu.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--accent-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2"
        >
          Zpět na úvod
        </Link>
      </div>
    </main>
  );
}
