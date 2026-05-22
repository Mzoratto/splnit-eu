import Link from "next/link";
import type { ComponentProps } from "react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

import { WorkspaceRenderer } from "@/components/workspaces/workspace-renderer";
import { DEMO_HETZNER_EVIDENCE } from "@/lib/demo/data";
import { hetznerWorkspace } from "@/lib/workspaces/hetzner";

const automatedControlKeys: ReadonlySet<string> = new Set(
  DEMO_HETZNER_EVIDENCE.map((item) => item.controlKey),
);

type WorkspaceProgressProp = ComponentProps<typeof WorkspaceRenderer>["progress"];

function buildDemoHetznerProgress(): WorkspaceProgressProp {
  let completedControls = 0;
  let totalControls = 0;

  const layers = hetznerWorkspace.layers.map((layer) => {
    let layerCompleted = 0;
    const controls = layer.controls.map((control) => {
      const hasEvidence = automatedControlKeys.has(control.controlKey);

      if (hasEvidence) {
        layerCompleted += 1;
      }

      return {
        assessmentResult: hasEvidence ? ("pass" as const) : ("unknown" as const),
        collectedAt: hasEvidence ? new Date("2026-05-21T08:00:00.000Z") : null,
        collectionStatus: hasEvidence ? ("collected" as const) : ("pending" as const),
        controlKey: control.controlKey,
        evidenceId: hasEvidence ? `demo-hetzner-${control.controlKey}` : null,
        hasEvidence,
      };
    });

    completedControls += layerCompleted;
    totalControls += layer.controls.length;

    return {
      completedControls: layerCompleted,
      completionPct: layer.controls.length > 0 ? layerCompleted / layer.controls.length : 0,
      controls,
      layerId: layer.id,
      totalControls: layer.controls.length,
    };
  });

  return {
    completedControls,
    layers,
    overallCompletionPct: totalControls > 0 ? completedControls / totalControls : 0,
    platformId: hetznerWorkspace.platformId,
    totalControls,
  };
}

export default function DemoHetznerWorkspacePage() {
  const progress = buildDemoHetznerProgress();

  return (
    <section className="space-y-6">
      <Link
        href="/demo/controls"
        className="inline-flex items-center gap-1.5 text-sm text-foreground/58 hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Zpět na demo kontroly
      </Link>

      <div>
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-primary">
          Demo workspace
        </p>
        <h1 className="mt-1 text-2xl font-semibold">Hetzner Cloud</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground/64">
          Automaticky ověřené důkazy pro server, firewall a snapshot. Tato
          stránka nevolá Hetzner API ani databázi.
        </p>
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
        Demo — attestace nelze odevzdávat. Pro skutečná data se přihlaste.
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {DEMO_HETZNER_EVIDENCE.map((item) => (
          <article
            key={item.controlKey}
            className="rounded-lg border border-[var(--status-pass-border)] bg-[var(--status-pass-subtle)] p-4 text-[var(--status-pass)]"
          >
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.12em] opacity-75">
                  {item.label}
                </p>
                <h2 className="mt-1 text-base font-semibold">{item.name}</h2>
                <p className="mt-1 text-sm text-foreground/68">{item.detail}</p>
                <p className="mt-2 text-xs text-foreground/52">
                  Ověřeno automaticky {item.verifiedAt}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="[&_form]:hidden">
        <WorkspaceRenderer
          commentsByControlKey={{}}
          mode="consultant_readonly"
          progress={progress}
          workspace={hetznerWorkspace}
        />
      </div>
    </section>
  );
}
