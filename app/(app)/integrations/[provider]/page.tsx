import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CircleDashed, PlugZap, ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { StatusPill } from "@/components/app/status-pill";

const plannedProviders: Record<
  string,
  {
    description: string;
    name: string;
    plannedChecks: string[];
  }
> = {
  "google-workspace": {
    description:
      "Google Workspace audit logy, sdílení Drive a kontrola administrátorských účtů jsou naplánované po ověření Microsoft 365, GitHub a AWS integrací.",
    name: "Google Workspace",
    plannedChecks: [
      "MFA administrátorů a revize privilegovaných účtů",
      "Externí sdílení v Google Drive",
      "Retence Workspace audit logů",
    ],
  },
};

export default async function IntegrationDetailPage({
  params,
}: {
  params: Promise<{ provider: string }>;
}) {
  const { provider } = await params;
  const plannedProvider = plannedProviders[provider];

  if (!plannedProvider) {
    notFound();
  }

  return (
    <section className="space-y-8">
      <PageHeader
        eyebrow="Plánovaná integrace"
        title={plannedProvider.name}
        subtitle={plannedProvider.description}
        actions={
          <Link href="/integrations" className="btn btn-secondary">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
            Zpět na integrace
          </Link>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <article className="card">
          <div className="flex items-center gap-2">
            <CircleDashed className="h-5 w-5 text-foreground/50" aria-hidden="true" strokeWidth={1.5} />
            <h2 className="text-lg font-medium">Stav</h2>
          </div>
          <div className="mt-4">
            <StatusPill tone="neutral">PENDING</StatusPill>
          </div>
          <p className="mt-2 text-sm text-foreground/58">
            OAuth tok ani ukládání tokenů pro tohoto poskytovatele zatím nejsou aktivní.
          </p>
        </article>

        <article className="card">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-primary" aria-hidden="true" strokeWidth={1.5} />
            <h2 className="text-lg font-medium">Plánované kontroly</h2>
          </div>
          <p className="mt-4 font-mono text-2xl font-medium">
            {plannedProvider.plannedChecks.length}
          </p>
          <p className="mt-2 text-sm text-foreground/58">
            Kontroly zatím nejsou zapojené do registru runnerů.
          </p>
        </article>

        <article className="card">
          <div className="flex items-center gap-2">
            <PlugZap className="h-5 w-5 text-primary" aria-hidden="true" strokeWidth={1.5} />
            <h2 className="text-lg font-medium">Závislost</h2>
          </div>
          <p className="mt-4 font-mono text-2xl font-medium">Fáze 2+</p>
          <p className="mt-2 text-sm text-foreground/58">
            Adaptér přidejte až po ověření aktuální sady poskytovatelů.
          </p>
        </article>
      </div>

      <section className="overflow-hidden rounded-lg border border-border bg-surface">
        <div className="border-b border-border p-5">
          <h2 className="text-lg font-medium">Rozsah</h2>
        </div>
        <div className="divide-y divide-border">
          {plannedProvider.plannedChecks.map((check) => (
            <article key={check} className="p-5">
              <p className="font-medium">{check}</p>
              <p className="mt-1 text-sm text-foreground/58">
                Plánováno. Produkční runner zatím není zapnutý.
              </p>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
