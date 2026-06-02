export default function AppLoading() {
  return (
    <main className="min-h-[60vh] bg-surface px-6 py-10 text-foreground" aria-busy="true">
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="h-8 w-56 rounded-lg bg-[var(--surface-muted)]" />
        <div className="grid gap-4 md:grid-cols-3">
          <div className="h-32 rounded-lg border border-border bg-[var(--surface-raised)]" />
          <div className="h-32 rounded-lg border border-border bg-[var(--surface-raised)]" />
          <div className="h-32 rounded-lg border border-border bg-[var(--surface-raised)]" />
        </div>
        <p className="sr-only">Načítání aplikace</p>
      </div>
    </main>
  );
}
