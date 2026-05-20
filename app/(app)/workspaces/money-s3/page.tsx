import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { ArrowLeft } from "lucide-react";
import { WorkspaceRenderer } from "@/components/workspaces/workspace-renderer";
import { hasDatabaseUrl } from "@/lib/db";
import { getWorkspaceProgress } from "@/lib/db/queries/workspaces";
import { moneyS3Workspace } from "@/lib/workspaces/money-s3";
import type { WorkspaceProgress } from "@/lib/db/queries/workspaces";

// Build a zero-evidence demo progress from the static config.
function buildDemoProgress(): WorkspaceProgress {
  const layers = moneyS3Workspace.layers.map((layer) => ({
    layerId: layer.id,
    completedControls: 0,
    totalControls: layer.controls.length,
    completionPct: 0,
    controls: layer.controls.map((ctrl) => ({
      controlKey: ctrl.controlKey,
      hasEvidence: false,
      assessmentResult: "unknown" as const,
      collectionStatus: "pending" as const,
      collectedAt: null,
      evidenceId: null,
    })),
  }));

  return {
    platformId: moneyS3Workspace.platformId,
    overallCompletionPct: 0,
    completedControls: 0,
    totalControls: moneyS3Workspace.layers.flatMap((l) => l.controls).length,
    layers,
  };
}

async function loadMoneyS3Progress(): Promise<{
  progress: WorkspaceProgress;
  mode: "live" | "demo";
}> {
  const clerkConfigured =
    Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
    Boolean(process.env.CLERK_SECRET_KEY);

  if (!clerkConfigured || !hasDatabaseUrl()) {
    return { progress: buildDemoProgress(), mode: "demo" };
  }

  const session = await auth();

  if (!session.orgId) {
    return { progress: buildDemoProgress(), mode: "demo" };
  }

  try {
    const progress = await getWorkspaceProgress(session.orgId, moneyS3Workspace);
    return { progress, mode: "live" };
  } catch {
    return { progress: buildDemoProgress(), mode: "demo" };
  }
}

export default async function MoneyS3WorkspacePage() {
  const { progress, mode } = await loadMoneyS3Progress();

  return (
    <section className="space-y-6">
      {/* Back navigation */}
      <Link
        href="/controls"
        className="inline-flex items-center gap-1.5 text-sm text-foreground/58 hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Zpět na přehled kontrol
      </Link>

      {/* Page heading */}
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-primary">
          Workspace
        </p>
        <h1 className="mt-1 text-2xl font-semibold">
          Money S3 / S4 (Seyfor)
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground/64">
          Průvodce shody pro Money S3 / S4 — projděte čtyřmi vrstvami (infrastruktura,
          přístupy, zálohy, API) a dokládejte důkazy přímo zde.
        </p>
      </div>

      {mode === "demo" ? (
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground/64">
          Demo — přihlaste se s organizací pro ukládání skutečných důkazů
        </div>
      ) : null}

      <WorkspaceRenderer workspace={moneyS3Workspace} progress={progress} />
    </section>
  );
}
