"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clipboard, Plus, Trash2, XCircle } from "lucide-react";
import {
  createTrustCenterClientAction,
  deleteTrustCenterClientAction,
  type ClientAccessActionState,
} from "./actions";

type ClientAccessRow = {
  accessToken: string;
  clientName: string;
  id: string;
  lastViewedAt: string | null;
  viewCount: number;
  visibleFrameworks: string[];
};

type FrameworkOption = {
  name: string;
  regulator: string | null;
  score: number | null;
  slug: string;
};

type ClientAccessSectionProps = {
  clients: ClientAccessRow[];
  enabled: boolean;
  frameworks: FrameworkOption[];
  publicUrl: string | null;
};

const initialState: ClientAccessActionState = {
  accessUrl: null,
  clientName: null,
  error: null,
};

function formatLastViewed(value: string | null) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("cs-CZ").format(new Date(value));
}

export function ClientAccessSection({
  clients,
  enabled,
  frameworks,
  publicUrl,
}: ClientAccessSectionProps) {
  const router = useRouter();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [deletePending, startDeleteTransition] = useTransition();
  const [state, formAction, createPending] = useActionState(
    createTrustCenterClientAction,
    initialState,
  );
  const canCreate = enabled && Boolean(publicUrl);

  useEffect(() => {
    if (!state.accessUrl) {
      return;
    }

    setIsFormOpen(false);
    router.refresh();
    void copyLink(state.accessUrl);
  }, [router, state.accessUrl]);

  async function copyLink(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      window.setTimeout(() => setCopiedUrl((current) => (current === url ? null : current)), 1800);
    } catch {
      setCopiedUrl(null);
    }
  }

  function revokeClient(clientId: string, clientName: string) {
    if (!window.confirm(`Opravdu zrušit přístup pro ${clientName}?`)) {
      return;
    }

    startDeleteTransition(async () => {
      await deleteTrustCenterClientAction(clientId);
      router.refresh();
    });
  }

  return (
    <section className="rounded-lg border border-border bg-surface p-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-semibold">Klientské přístupy</h2>
          <p className="mt-1 text-sm text-foreground/58">
            Sdílejte Trust Center se zákazníky přes pojmenované odkazy.
          </p>
        </div>
        {canCreate ? (
          <button
            type="button"
            onClick={() => setIsFormOpen((value) => !value)}
            className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-surface-muted"
          >
            {isFormOpen ? (
              <XCircle className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Plus className="h-4 w-4" aria-hidden="true" />
            )}
            Přidat klientský přístup
          </button>
        ) : null}
      </div>

      {!canCreate ? (
        <p className="mt-5 rounded-md border border-border bg-surface-muted p-4 text-sm text-foreground/64">
          Nejprve zveřejněte Trust Center, aby mohly klientské odkazy fungovat.
        </p>
      ) : null}

      {isFormOpen && canCreate ? (
        <form action={formAction} className="mt-5 rounded-md border border-border p-4">
          <div className="grid gap-4">
            <label className="grid gap-2 text-sm">
              Název zákazníka
              <input
                name="clientName"
                required
                maxLength={200}
                disabled={createPending}
                className="rounded-md border border-border bg-background px-3 py-2"
              />
            </label>
            <div>
              <p className="text-sm font-medium">Viditelné předpisy</p>
              <p className="mt-1 text-xs text-foreground/56">
                Prázdný výběr = zákazník vidí vše, co je ve vašem Trust Center nastaveno.
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {frameworks.map((framework) => (
                  <label
                    key={framework.slug}
                    className="flex items-start gap-3 rounded-md border border-border px-3 py-3 text-sm"
                  >
                    <input
                      name="visibleFrameworks"
                      type="checkbox"
                      value={framework.slug}
                      disabled={createPending}
                    />
                    <span>
                      <span className="block font-medium">{framework.name}</span>
                      <span className="text-xs text-foreground/56">
                        {framework.regulator ?? "Bez regulátora"} · skóre {framework.score ?? 0}%
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          {state.error ? (
            <p className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {state.error}
            </p>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={createPending}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              Vytvořit přístup
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              disabled={createPending}
              className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-3 text-sm font-medium hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              Zrušit
            </button>
          </div>
        </form>
      ) : null}

      {canCreate ? (
        <div className="mt-5 grid gap-3">
          {clients.length ? (
            clients.map((client) => {
              const accessUrl = `${publicUrl}?access=${client.accessToken}`;
              const lastViewed = formatLastViewed(client.lastViewedAt);
              const frameworkSummary = client.visibleFrameworks.length
                ? client.visibleFrameworks.join(", ")
                : "Všechny";

              return (
                <article
                  key={client.id}
                  className="grid gap-4 rounded-md border border-border p-4 md:grid-cols-[1fr_auto]"
                >
                  <div>
                    <p className="font-medium">{client.clientName}</p>
                    <p className="mt-1 text-sm text-foreground/58">
                      Viditelné předpisy: {frameworkSummary}
                    </p>
                    <p className="mt-1 text-sm text-foreground/58">
                      {client.viewCount > 0 && lastViewed
                        ? `Zobrazeno ${client.viewCount}× | Naposledy ${lastViewed}`
                        : "Zatím neotevřeno"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void copyLink(accessUrl)}
                      className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-surface-muted"
                    >
                      <Clipboard className="h-4 w-4" aria-hidden="true" />
                      {copiedUrl === accessUrl ? "Zkopírováno!" : "Kopírovat odkaz"}
                    </button>
                    <button
                      type="button"
                      onClick={() => revokeClient(client.id, client.clientName)}
                      disabled={deletePending}
                      className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium text-danger hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                      Zrušit
                    </button>
                  </div>
                </article>
              );
            })
          ) : (
            <p className="rounded-md border border-border px-3 py-3 text-sm text-foreground/58">
              Zatím žádné klientské přístupy. Vytvořte první.
            </p>
          )}
        </div>
      ) : null}
    </section>
  );
}
