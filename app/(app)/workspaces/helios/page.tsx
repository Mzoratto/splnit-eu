import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getLocale } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { WorkspaceRenderer } from "@/components/workspaces/workspace-renderer";
import { getMessagesForLocale } from "@/i18n/messages";
import { normalizeLocale } from "@/i18n/routing";
import { hasDatabaseUrl } from "@/lib/db";
import {
  groupCommentsByControlKey,
  listControlCommentsForOrg,
  type ControlComment,
} from "@/lib/db/queries/agencies";
import { getWorkspaceProgress } from "@/lib/db/queries/workspaces";
import { heliosWorkspace } from "@/lib/workspaces/helios";
import type { WorkspaceProgress } from "@/lib/db/queries/workspaces";

// Build a zero-evidence demo progress from the static config.
function buildDemoProgress(): WorkspaceProgress {
  const layers = heliosWorkspace.layers.map((layer) => ({
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
    platformId: heliosWorkspace.platformId,
    overallCompletionPct: 0,
    completedControls: 0,
    totalControls: heliosWorkspace.layers.flatMap((l) => l.controls).length,
    layers,
  };
}

async function loadHeliosProgress(): Promise<{
  commentsByControlKey: Record<string, ControlComment[]>;
  progress: WorkspaceProgress;
  mode: "live" | "demo";
}> {
  const clerkConfigured =
    Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
    Boolean(process.env.CLERK_SECRET_KEY);

  if (!clerkConfigured || !hasDatabaseUrl()) {
    return { commentsByControlKey: {}, progress: buildDemoProgress(), mode: "demo" };
  }

  const session = await auth();

  if (!session.orgId) {
    return { commentsByControlKey: {}, progress: buildDemoProgress(), mode: "demo" };
  }

  try {
    const [progress, comments] = await Promise.all([
      getWorkspaceProgress(session.orgId, heliosWorkspace),
      listControlCommentsForOrg(session.orgId),
    ]);
    return {
      commentsByControlKey: groupCommentsByControlKey(comments),
      progress,
      mode: "live",
    };
  } catch {
    return { commentsByControlKey: {}, progress: buildDemoProgress(), mode: "demo" };
  }
}

export default async function HeliosWorkspacePage() {
  const requestLocale = normalizeLocale(await getLocale()) ?? "cs-CZ";
  const copy = getMessagesForLocale(requestLocale).workspace;
  const { commentsByControlKey, progress, mode } = await loadHeliosProgress();

  return (
    <section className="space-y-6">
      {/* Back navigation */}
      <Link
        href="/controls"
        className="inline-flex items-center gap-1.5 text-sm text-foreground/58 hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {copy.backToControls}
      </Link>

      {/* Page heading */}
      <div className="rounded-lg border border-border bg-white p-5 shadow-xs">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <span className="grid h-14 w-14 place-items-center rounded-lg bg-teal-600 text-sm font-bold text-white">
            HL
          </span>
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-primary">
              {copy.pageEyebrow}
            </p>
            <h1 className="mt-1 text-2xl font-semibold">
              Helios (Asseco)
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground/64">
              {copy.platformGuide.replace("{platform}", "Helios")}
            </p>
          </div>
        </div>
      </div>

      {mode === "demo" ? (
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground/64">
          {copy.demoNotice}
        </div>
      ) : null}

      <WorkspaceRenderer
        commentsByControlKey={commentsByControlKey}
        workspace={heliosWorkspace}
        progress={progress}
      />
    </section>
  );
}
