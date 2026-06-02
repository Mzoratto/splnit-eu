export default function AppNotFound() {
  return (
    <main className="min-h-[60vh] bg-surface px-6 py-16 text-foreground">
      <div className="mx-auto max-w-2xl rounded-lg border border-border bg-[var(--surface-raised)] p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-foreground/60">404</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">Záznam nebo stránka nebyly nalezeny.</h1>
        <p className="mt-3 text-sm leading-6 text-foreground/70">
          Zkontrolujte organizaci, oprávnění nebo adresu stránky.
        </p>
        <a
          href="/dashboard"
          className="mt-6 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--accent-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2"
        >
          Zpět na dashboard
        </a>
      </div>
    </main>
  );
}
