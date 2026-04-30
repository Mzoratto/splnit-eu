import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import {
  CheckCircle2,
  ExternalLink,
  FileSignature,
  Globe2,
  XCircle,
} from "lucide-react";
import { hasDatabaseUrl } from "@/lib/db";
import { getTrustCenterSettings } from "@/lib/db/queries/trust-center";
import { FRAMEWORK_LIBRARY } from "@/lib/frameworks/registry";
import {
  approveTrustCenterRequestAction,
  declineTrustCenterRequestAction,
  updateTrustCenterSettingsAction,
} from "./actions";

export const dynamic = "force-dynamic";

async function loadSettings() {
  const clerkConfigured =
    Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
    Boolean(process.env.CLERK_SECRET_KEY);

  if (!clerkConfigured || !hasDatabaseUrl()) {
    return null;
  }

  const session = await auth();

  if (!session.orgId) {
    return null;
  }

  return getTrustCenterSettings(session.orgId).catch(() => null);
}

function formatDate(value: Date | string | null | undefined) {
  if (!value) {
    return "nikdy";
  }

  return new Intl.DateTimeFormat("cs-CZ", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function TrustCenterSettingsPage() {
  const data = await loadSettings();
  const trustCenter = data?.trustCenter ?? null;
  const visibleFrameworks = trustCenter?.visibleFrameworks ?? [];
  const enrolledFrameworks =
    data?.frameworks.length
      ? data.frameworks
      : FRAMEWORK_LIBRARY.slice(0, 4).map((framework, index) => ({
          id: framework.slug,
          nameCs: framework.nameCs,
          regulator: framework.regulator,
          score: [72, 64, 81, 55][index] ?? null,
          slug: framework.slug,
          status: "active",
        }));
  const subdomain = trustCenter?.subdomain ?? "demo";
  const publicUrl = `/trust/${subdomain}`;
  const canMutate = Boolean(data);

  return (
    <section className="space-y-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-primary">
            Trust Center
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">
            Veřejné compliance centrum
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground/64">
            Nastavení veřejné stránky, viditelných frameworků a NDA gate.
          </p>
        </div>
        <Link
          href={publicUrl}
          className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-3 text-sm font-medium hover:bg-surface-muted"
        >
          Otevřít veřejnou stránku
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
        <section className="rounded-lg border border-border bg-surface p-5">
          <div className="flex items-center gap-2">
            <Globe2 className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-lg font-semibold">Konfigurace</h2>
          </div>
          <form action={updateTrustCenterSettingsAction} className="mt-5 space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm">
                Public slug
                <input
                  name="subdomain"
                  defaultValue={subdomain}
                  disabled={!canMutate}
                  className="rounded-md border border-border bg-background px-3 py-2"
                />
              </label>
              <label className="grid gap-2 text-sm">
                Accent colour
                <input
                  name="accentColor"
                  defaultValue={trustCenter?.accentColor ?? "#1b7f5a"}
                  disabled={!canMutate}
                  type="color"
                  className="h-10 rounded-md border border-border bg-background px-2 py-1"
                />
              </label>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex items-center gap-3 rounded-md border border-border px-3 py-3 text-sm">
                <input
                  name="isPublic"
                  type="checkbox"
                  defaultChecked={trustCenter?.isPublic ?? false}
                  disabled={!canMutate}
                />
                Publikovat Trust Center
              </label>
              <label className="flex items-center gap-3 rounded-md border border-border px-3 py-3 text-sm">
                <input
                  name="ndaRequired"
                  type="checkbox"
                  defaultChecked={trustCenter?.ndaRequired ?? false}
                  disabled={!canMutate}
                />
                Vyžadovat NDA gate
              </label>
            </div>
            <div>
              <p className="text-sm font-medium">Viditelné frameworky</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {enrolledFrameworks.map((framework) => (
                  <label
                    key={framework.slug}
                    className="flex items-start gap-3 rounded-md border border-border px-3 py-3 text-sm"
                  >
                    <input
                      name="visibleFrameworks"
                      type="checkbox"
                      value={framework.slug}
                      defaultChecked={
                        visibleFrameworks.length === 0 ||
                        visibleFrameworks.includes(framework.slug)
                      }
                      disabled={!canMutate}
                    />
                    <span>
                      <span className="block font-medium">{framework.nameCs}</span>
                      <span className="text-xs text-foreground/56">
                        {framework.regulator ?? "regulator n/a"} · skóre{" "}
                        {framework.score ?? 0}%
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <button
              type="submit"
              disabled={!canMutate}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              Uložit nastavení
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            </button>
          </form>
        </section>

        <section className="rounded-lg border border-border bg-surface">
          <div className="flex items-center gap-2 border-b border-border p-5">
            <FileSignature className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-lg font-semibold">NDA žádosti</h2>
          </div>
          <div className="divide-y divide-border">
            {data?.requests.length ? (
              data.requests.map((request) => (
                <article
                  key={request.id}
                  className="grid gap-4 p-5 md:grid-cols-[1fr_auto]"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{request.email}</p>
                      <span className="rounded-md bg-surface-muted px-2 py-1 text-xs">
                        {request.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-foreground/58">
                      {request.company ?? "firma neuvedena"} · vytvořeno{" "}
                      {formatDate(request.createdAt)}
                    </p>
                    <p className="mt-1 text-sm text-foreground/58">
                      Přístup expiruje {formatDate(request.expiresAt)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <form
                      action={approveTrustCenterRequestAction.bind(null, request.id)}
                    >
                      <button
                        type="submit"
                        disabled={request.status === "approved"}
                        className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Schválit
                        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </form>
                    <form
                      action={declineTrustCenterRequestAction.bind(null, request.id)}
                    >
                      <button
                        type="submit"
                        disabled={request.status === "declined"}
                        className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium text-danger hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Zamítnout
                        <XCircle className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </form>
                  </div>
                </article>
              ))
            ) : (
              <p className="p-5 text-sm text-foreground/58">
                Žádné NDA žádosti zatím nejsou otevřené.
              </p>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
