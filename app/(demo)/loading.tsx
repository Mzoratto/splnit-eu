export default function DemoLoading() {
  return (
    <main className="min-h-[60vh] bg-surface px-6 py-10 text-foreground" aria-busy="true">
      <div className="mx-auto max-w-4xl space-y-4">
        <div className="h-8 w-48 rounded-lg bg-[var(--surface-muted)]" />
        <div className="h-48 rounded-lg border border-border bg-[var(--surface-raised)]" />
        <p className="sr-only">Načítání demo stránky</p>
      </div>
    </main>
  );
}
