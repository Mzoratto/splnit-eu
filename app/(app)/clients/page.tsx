import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import {
  ArrowRight,
  BriefcaseBusiness,
  LockKeyhole,
  Plus,
  Sparkles,
} from "lucide-react";
import { hasDatabaseUrl } from "@/lib/db";
import { getConsultantClients } from "@/lib/db/queries/consultant-clients";
import { getOrganisationByClerkOrgId } from "@/lib/db/queries/organisations";
import { hasPlanAccess, normalizePlanKey } from "@/lib/stripe/plans";
import { linkClientAction } from "./actions";

export const dynamic = "force-dynamic";

const fallbackClients = [
  {
    accessLevel: "manage",
    clientOrgId: "demo-acme",
    createdAt: new Date("2026-04-01T10:00:00.000Z"),
    frameworkCount: 4,
    id: "demo-acme",
    inviteEmail: "security@acme.cz",
    name: "Acme Manufacturing CZ",
    plan: "business",
    score: 84,
    sector: "Výroba",
    status: "active",
    updatedAt: new Date("2026-04-28T10:00:00.000Z"),
    whiteLabelAccentColor: "#1b7f5a",
    whiteLabelLogoUrl: null,
  },
  {
    accessLevel: "view",
    clientOrgId: "demo-finedge",
    createdAt: new Date("2026-03-15T10:00:00.000Z"),
    frameworkCount: 3,
    id: "demo-finedge",
    inviteEmail: "compliance@finedge.cz",
    name: "FinEdge CZ",
    plan: "starter",
    score: 71,
    sector: "Finance",
    status: "active",
    updatedAt: new Date("2026-04-25T10:00:00.000Z"),
    whiteLabelAccentColor: "#2563eb",
    whiteLabelLogoUrl: null,
  },
];

async function loadClients() {
  const clerkConfigured =
    Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
    Boolean(process.env.CLERK_SECRET_KEY);

  if (!clerkConfigured || !hasDatabaseUrl()) {
    return {
      canManage: false,
      clients: fallbackClients,
      demoMode: true,
      plan: "consultant",
    };
  }

  const session = await auth();
  if (!session.orgId) {
    return {
      canManage: false,
      clients: [],
      demoMode: false,
      plan: "free",
    };
  }

  const organisation = await getOrganisationByClerkOrgId(session.orgId);
  const plan = normalizePlanKey(organisation?.plan);

  if (!hasPlanAccess(plan, "consultant")) {
    return {
      canManage: false,
      clients: [],
      demoMode: false,
      plan,
    };
  }

  return {
    canManage: true,
    clients: await getConsultantClients(session.orgId),
    demoMode: false,
    plan,
  };
}

function ClientSparkline({ score }: { score: number }) {
  const points = [score - 8, score - 3, score - 6, score - 1, score]
    .map((value) => Math.max(20, Math.min(98, value)))
    .map((value, index) => `${index * 28},${100 - value}`)
    .join(" ");

  return (
    <svg
      aria-hidden="true"
      className="h-12 w-36"
      viewBox="0 0 112 100"
      preserveAspectRatio="none"
    >
      <polyline
        fill="none"
        points={points}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="8"
        className="text-primary"
      />
    </svg>
  );
}

function formatDate(value: Date | string | null | undefined) {
  if (!value) {
    return "nikdy";
  }

  return new Intl.DateTimeFormat("cs-CZ", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export default async function ClientsPage() {
  const data = await loadClients();

  return (
    <section className="space-y-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-primary">
            Consultant
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">
            Klientský dashboard
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground/64">
            Spravujte klientské organizace, sledujte skóre a připravte
            white-label Trust Center výstupy.
          </p>
        </div>
        <Link
          href="/settings/billing"
          className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-3 text-sm font-medium hover:bg-surface-muted"
        >
          Plán: {data.plan}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      {!data.canManage ? (
        <section className="rounded-lg border border-border bg-surface p-5">
          <div className="flex items-start gap-3">
            <LockKeyhole className="mt-1 h-5 w-5 text-primary" aria-hidden="true" />
            <div>
              <h2 className="text-lg font-semibold">
                {data.demoMode ? "Demo režim" : "Vyžaduje Consultant plán"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-foreground/64">
                {data.demoMode
                  ? "Clerk nebo databáze nejsou dostupné, proto je formulář zamčený a stránka používá ukázková klientská data."
                  : "Produkční propojení klientských organizací je dostupné pouze pro consultant plán."}
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.4fr]">
        <section className="rounded-lg border border-border bg-surface p-5">
          <div className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-lg font-semibold">Připojit klienta</h2>
          </div>
          <form action={linkClientAction} className="mt-5 space-y-4">
            <label className="grid gap-2 text-sm">
              Clerk org ID klienta
              <input
                name="clientOrgId"
                placeholder="org_..."
                disabled={!data.canManage}
                required
                className="rounded-md border border-border bg-background px-3 py-2"
              />
            </label>
            <label className="grid gap-2 text-sm">
              Kontaktní email
              <input
                name="inviteEmail"
                type="email"
                disabled={!data.canManage}
                className="rounded-md border border-border bg-background px-3 py-2"
              />
            </label>
            <label className="grid gap-2 text-sm">
              Přístup
              <select
                name="accessLevel"
                defaultValue="manage"
                disabled={!data.canManage}
                className="rounded-md border border-border bg-background px-3 py-2"
              >
                <option value="view">Read only</option>
                <option value="manage">Manage controls</option>
                <option value="admin">Admin</option>
              </select>
            </label>
            <button
              type="submit"
              disabled={!data.canManage}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              Uložit propojení
              <BriefcaseBusiness className="h-4 w-4" aria-hidden="true" />
            </button>
          </form>
        </section>

        <section className="rounded-lg border border-border bg-surface">
          <div className="flex items-center gap-2 border-b border-border p-5">
            <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-lg font-semibold">Klienti</h2>
          </div>
          <div className="divide-y divide-border">
            {data.clients.length ? (
              data.clients.map((client) => (
                <Link
                  key={client.clientOrgId}
                  href={`/clients/${client.clientOrgId}`}
                  className="grid gap-4 p-5 hover:bg-surface-muted md:grid-cols-[1fr_auto]"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{client.name}</h3>
                      <span className="rounded-md bg-surface-muted px-2 py-1 text-xs">
                        {client.accessLevel}
                      </span>
                      <span className="rounded-md bg-surface-muted px-2 py-1 text-xs">
                        {client.plan}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-foreground/58">
                      {client.sector ?? "sektor neuveden"} ·{" "}
                      {client.frameworkCount} frameworky · poslední změna{" "}
                      {formatDate(client.updatedAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <ClientSparkline score={client.score} />
                    <div className="text-right">
                      <p className="font-mono text-3xl font-semibold text-primary">
                        {client.score}%
                      </p>
                      <p className="text-xs text-foreground/56">avg score</p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <p className="p-5 text-sm text-foreground/58">
                Zatím nemáte připojeného žádného klienta.
              </p>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
