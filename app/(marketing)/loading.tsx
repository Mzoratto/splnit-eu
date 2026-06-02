export default function MarketingLoading() {
  return (
    <main className="min-h-[60vh] bg-surface px-5 py-16" aria-busy="true" aria-label="Načítáme stránku">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="h-4 w-32 rounded-full bg-[var(--accent-subtle)]" />
        <div className="h-10 max-w-xl rounded-lg bg-surface-muted" />
        <div className="grid gap-4 md:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-32 rounded-lg border border-border bg-surface-muted" />
          ))}
        </div>
      </div>
    </main>
  );
}
