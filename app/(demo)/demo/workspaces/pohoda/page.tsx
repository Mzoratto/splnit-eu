import Link from "next/link";
import type { ComponentProps } from "react";
import { ArrowLeft, AlertTriangle } from "lucide-react";

import { WorkspaceRenderer } from "@/components/workspaces/workspace-renderer";
import {
  DEMO_POHODA_LAYERS,
  DEMO_POHODA_OPEN_ATTESTATION,
} from "@/lib/demo/data";
import { pohodaWorkspace } from "@/lib/workspaces/pohoda";

type WorkspaceProgressProp = ComponentProps<typeof WorkspaceRenderer>["progress"];

function buildDemoPohodaProgress(): WorkspaceProgressProp {
  let completedControls = 0;
  let totalControls = 0;

  const layers = pohodaWorkspace.layers.map((layer) => {
    const demoLayer = DEMO_POHODA_LAYERS.find((item) => item.id === layer.id);
    const completedTarget = Math.min(
      layer.controls.length,
      Math.round((demoLayer?.completionPct ?? 0) * layer.controls.length),
    );
    let layerCompleted = 0;

    const controls = layer.controls.map((control, index) => {
      const isBackupGap =
        control.controlKey === DEMO_POHODA_OPEN_ATTESTATION.controlKey;
      const hasEvidence = isBackupGap || index < completedTarget;
      const assessmentResult = isBackupGap
        ? ("gap" as const)
        : hasEvidence
          ? ("pass" as const)
          : ("unknown" as const);
      const collectionStatus = hasEvidence ? ("collected" as const) : ("pending" as const);

      if (hasEvidence && assessmentResult === "pass") {
        layerCompleted += 1;
      }

      return {
        assessmentResult,
        collectedAt: hasEvidence ? new Date("2026-05-21T08:00:00.000Z") : null,
        collectionStatus,
        controlKey: control.controlKey,
        evidenceId: hasEvidence ? `demo-pohoda-${control.controlKey}` : null,
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
    platformId: pohodaWorkspace.platformId,
    totalControls,
  };
}

export default function DemoPohodaWorkspacePage() {
  const progress = buildDemoPohodaProgress();

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
        <h1 className="mt-1 text-2xl font-semibold">Pohoda (Stormware)</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground/64">
          Předvyplněný pohled na účetní systém Kovárny Novák. Attestace jsou v
          demu jen pro čtení a neukládají žádná data.
        </p>
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
        Demo — attestace nelze odevzdávat. Pro skutečná data se přihlaste.
      </div>

      <div className="flex gap-3 rounded-lg border border-[var(--status-fail-border)] bg-[var(--status-fail-subtle)] p-4 text-sm leading-6 text-[var(--status-fail)]">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
        <div>
          <p className="font-medium">{DEMO_POHODA_OPEN_ATTESTATION.title}</p>
          <p className="mt-1 text-foreground/72">
            {DEMO_POHODA_OPEN_ATTESTATION.summary}
          </p>
        </div>
      </div>

      <div className="[&_form]:hidden">
        <WorkspaceRenderer
          commentsByControlKey={{}}
          mode="consultant_readonly"
          progress={progress}
          workspace={pohodaWorkspace}
        />
      </div>
    </section>
  );
}
