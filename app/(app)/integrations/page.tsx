import Link from "next/link";
import { ArrowRight, Cloud, GitBranch, MonitorCog } from "lucide-react";

const integrations = [
  {
    description: "MFA, Conditional Access, hosté, privilegované role a sensitivity labels.",
    href: "/integrations/microsoft365",
    icon: MonitorCog,
    name: "Microsoft 365",
    status: "available",
  },
  {
    description: "Branch protection, secret scanning, 2FA enforcement a dependency alerts.",
    href: "/integrations/github",
    icon: GitBranch,
    name: "GitHub",
    status: "available",
  },
  {
    description: "CloudTrail, S3 šifrování, IAM MFA, root MFA a VPC Flow Logs.",
    href: "/integrations/aws",
    icon: Cloud,
    name: "AWS",
    status: "coming_soon",
  },
];

export default function IntegrationsPage() {
  return (
    <section className="space-y-6">
      <div className="max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-[0.14em] text-primary">
          Integrace
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal">
          Automatické testy
        </h1>
        <p className="mt-3 text-base leading-7 text-foreground/68">
          Připojené služby dodávají důkazy a aktualizují stavy kontrol.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {integrations.map((integration) => {
          const Icon = integration.icon;

          return (
            <article
              key={integration.name}
              className="rounded-lg border border-border bg-surface p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-foreground/58">{integration.status}</p>
                  <h2 className="mt-1 text-xl font-semibold">{integration.name}</h2>
                </div>
                <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
              </div>
              <p className="mt-3 min-h-24 text-sm leading-6 text-foreground/64">
                {integration.description}
              </p>
              <Link
                href={integration.href}
                className="mt-5 inline-flex items-center gap-2 rounded-md border border-border px-4 py-3 text-sm font-medium hover:bg-surface-muted"
              >
                Otevřít
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}
