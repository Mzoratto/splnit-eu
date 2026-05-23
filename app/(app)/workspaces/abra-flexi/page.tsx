import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getLocale } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { WorkspaceRenderer } from "@/components/workspaces/workspace-renderer";
import { getMessagesForLocale } from "@/i18n/messages";
import { normalizeLocale, type Locale } from "@/i18n/routing";
import { hasDatabaseUrl } from "@/lib/db";
import {
  groupCommentsByControlKey,
  listControlCommentsForOrg,
  type ControlComment,
} from "@/lib/db/queries/agencies";
import { getIntegrationDetail } from "@/lib/db/queries/integrations";
import { getOrganisationByClerkOrgId } from "@/lib/db/queries/organisations";
import {
  getWorkspaceProgress,
  type WorkspaceProgress,
} from "@/lib/db/queries/workspaces";
import { abraFlexiWorkspace } from "@/lib/workspaces/abra-flexi";
import { AbraFlexiConnectionForm } from "./connection-form";

export const dynamic = "force-dynamic";

function buildDemoProgress(): WorkspaceProgress {
  const layers = abraFlexiWorkspace.layers.map((layer) => ({
    layerId: layer.id,
    completedControls: 0,
    totalControls: layer.controls.length,
    completionPct: 0,
    controls: layer.controls.map((control) => ({
      assessmentResult: "unknown" as const,
      collectedAt: null,
      collectionStatus: "pending" as const,
      controlKey: control.controlKey,
      evidenceId: null,
      hasEvidence: false,
    })),
  }));

  return {
    completedControls: 0,
    layers,
    overallCompletionPct: 0,
    platformId: abraFlexiWorkspace.platformId,
    totalControls: abraFlexiWorkspace.layers.flatMap((layer) => layer.controls).length,
  };
}

async function loadAbraFlexiWorkspace(requestLocale: Locale): Promise<{
  commentsByControlKey: Record<string, ControlComment[]>;
  connected: boolean;
  mode: "live" | "demo";
  organisationLocale: string | null;
  progress: WorkspaceProgress;
}> {
  const clerkConfigured =
    Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
    Boolean(process.env.CLERK_SECRET_KEY);

  if (!clerkConfigured || !hasDatabaseUrl()) {
    return {
      commentsByControlKey: {},
      connected: false,
      mode: "demo",
      organisationLocale: requestLocale,
      progress: buildDemoProgress(),
    };
  }

  const session = await auth();

  if (!session.orgId) {
    return {
      commentsByControlKey: {},
      connected: false,
      mode: "demo",
      organisationLocale: requestLocale,
      progress: buildDemoProgress(),
    };
  }

  try {
    const [organisation, integrationDetail, progress, comments] = await Promise.all([
      getOrganisationByClerkOrgId(session.orgId),
      getIntegrationDetail({
        clerkOrgId: session.orgId,
        provider: "abra-flexi",
      }),
      getWorkspaceProgress(session.orgId, abraFlexiWorkspace),
      listControlCommentsForOrg(session.orgId),
    ]);

    return {
      commentsByControlKey: groupCommentsByControlKey(comments),
      connected: integrationDetail.integration?.status === "connected",
      mode: "live",
      organisationLocale: organisation?.locale ?? null,
      progress,
    };
  } catch {
    return {
      commentsByControlKey: {},
      connected: false,
      mode: "demo",
      organisationLocale: requestLocale,
      progress: buildDemoProgress(),
    };
  }
}

export default async function AbraFlexiWorkspacePage() {
  const requestLocale = normalizeLocale(await getLocale()) ?? "cs-CZ";
  const {
    commentsByControlKey,
    connected,
    mode,
    organisationLocale,
    progress,
  } = await loadAbraFlexiWorkspace(requestLocale);
  const locale = normalizeLocale(organisationLocale) ?? requestLocale;
  const copy = getMessagesForLocale(locale).abraFlexiWorkspace;

  return (
    <section className="space-y-6">
      <Link
        href="/controls"
        className="inline-flex items-center gap-1.5 text-sm text-foreground/58 hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {copy.back}
      </Link>

      <div className="rounded-lg border border-border bg-white p-5 shadow-xs">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <span className="grid h-14 w-14 place-items-center rounded-lg bg-purple-600 text-sm font-bold text-white">
            AB
          </span>
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-primary">
              {copy.eyebrow}
            </p>
            <h1 className="mt-1 text-2xl font-semibold">
              {copy.title}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground/64">
              {copy.subtitle}
            </p>
          </div>
        </div>
      </div>

      {mode === "demo" ? (
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground/64">
          {copy.demoMode}
        </div>
      ) : null}

      {connected ? (
        <WorkspaceRenderer
          commentsByControlKey={commentsByControlKey}
          workspace={abraFlexiWorkspace}
          progress={progress}
        />
      ) : (
        <AbraFlexiConnectionForm copy={copy.connection} />
      )}
    </section>
  );
}
