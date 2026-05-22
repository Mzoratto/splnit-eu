import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getLocale } from "next-intl/server";
import { ArrowLeft, MessageSquareText, ShieldCheck } from "lucide-react";
import { WorkspaceRenderer } from "@/components/workspaces/workspace-renderer";
import { getMessagesForLocale } from "@/i18n/messages";
import { normalizeLocale } from "@/i18n/routing";
import { getControlDisplayTitle } from "@/lib/controls/localization";
import { calculateComplianceScore } from "@/lib/dashboard/score";
import {
  groupCommentsByControlKey,
  listControlCommentsForManagedClient,
  requireAgencyConsultant,
  requireManagedClient,
} from "@/lib/db/queries/agencies";
import { getDashboardData } from "@/lib/db/queries/dashboard";
import {
  getWorkspaceProgress,
  type WorkspaceProgress,
} from "@/lib/db/queries/workspaces";
import { abraFlexiWorkspace } from "@/lib/workspaces/abra-flexi";
import { heliosWorkspace } from "@/lib/workspaces/helios";
import { moneyS3Workspace } from "@/lib/workspaces/money-s3";
import { pohodaWorkspace } from "@/lib/workspaces/pohoda";
import type { PlatformWorkspace } from "@/lib/workspaces/types";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ orgId: string }>;
};

const WORKSPACES = [
  pohodaWorkspace,
  moneyS3Workspace,
  heliosWorkspace,
  abraFlexiWorkspace,
] as const;

function buildEmptyProgress(workspace: PlatformWorkspace): WorkspaceProgress {
  const layers = workspace.layers.map((layer) => ({
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
    platformId: workspace.platformId,
    totalControls: workspace.layers.flatMap((layer) => layer.controls).length,
  };
}

function statusLabel(status: string, copy: ReturnType<typeof getMessagesForLocale>["agency"]["client"]) {
  return copy.statuses[status as keyof typeof copy.statuses] ?? status;
}

export default async function AgencyClientPage({ params }: PageProps) {
  const { orgId } = await params;
  const session = await auth();
  const membership = await requireAgencyConsultant(session.userId ?? "");
  const requestLocale = normalizeLocale(await getLocale()) ?? "cs-CZ";
  let managedClient: Awaited<ReturnType<typeof requireManagedClient>>;

  try {
    managedClient = await requireManagedClient({
      agencyId: membership.agency.id,
      orgId,
    });
  } catch {
    notFound();
  }

  const [dashboard, comments, workspaceProgress] = await Promise.all([
    getDashboardData(orgId),
    listControlCommentsForManagedClient({
      agencyId: membership.agency.id,
      orgId,
    }),
    Promise.all(
      WORKSPACES.map(async (workspace) => {
        try {
          return {
            progress: await getWorkspaceProgress(orgId, workspace),
            workspace,
          };
        } catch {
          return {
            progress: buildEmptyProgress(workspace),
            workspace,
          };
        }
      }),
    ),
  ]);
  const locale = normalizeLocale(dashboard.organisationLocale) ?? requestLocale;
  const localizedCopy = getMessagesForLocale(locale).agency.client;
  const commentsByControlKey = groupCommentsByControlKey(comments);
  const score = calculateComplianceScore({
    frameworkScores: dashboard.frameworkScores,
    statusRows: dashboard.statusRows,
  });
  const openGaps = dashboard.statusRows.filter((row) =>
    ["fail", "manual_review", "unknown", "warning"].includes(row.status),
  ).length;
  const priorityControls = dashboard.priorityControls.map((control) => ({
    ...control,
    title: getControlDisplayTitle(
      {
        key: control.key,
        titleCs: control.titleCs,
        titleEn: control.titleEn,
      },
      locale,
    ),
  }));

  return (
    <section className="space-y-6">
      <Link
        href="/agency/dashboard"
        className="inline-flex items-center gap-2 text-sm font-medium text-primary"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
        {localizedCopy.back}
      </Link>

      <div className="rounded-lg border border-primary/25 bg-primary/8 p-4 text-sm leading-6 text-foreground/72">
        <p className="font-medium text-primary">{localizedCopy.banner.title}</p>
        <p className="mt-1">{localizedCopy.banner.body}</p>
      </div>

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-primary">
            {localizedCopy.eyebrow}
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-normal">
            {managedClient.client.name}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground/64">
            {managedClient.client.sector ?? localizedCopy.sectorEmpty} ·{" "}
            {managedClient.client.country} · {managedClient.client.plan}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-surface px-4 py-3">
            <p className="text-xs text-foreground/58">{localizedCopy.score}</p>
            <p className="mt-1 font-mono text-2xl font-semibold text-primary">
              {score}%
            </p>
          </div>
          <div className="rounded-lg border border-border bg-surface px-4 py-3">
            <p className="text-xs text-foreground/58">{localizedCopy.openGaps}</p>
            <p className="mt-1 font-mono text-2xl font-semibold text-primary">
              {openGaps}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-surface px-4 py-3">
            <p className="text-xs text-foreground/58">{localizedCopy.comments}</p>
            <p className="mt-1 font-mono text-2xl font-semibold text-primary">
              {comments.length}
            </p>
          </div>
        </div>
      </div>

      <section className="rounded-lg border border-border bg-surface">
        <div className="flex items-center gap-2 border-b border-border p-4">
          <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" strokeWidth={1.5} />
          <h2 className="font-medium">{localizedCopy.priorityControls}</h2>
        </div>
        <div className="divide-y divide-border">
          {priorityControls.length ? (
            priorityControls.slice(0, 6).map((control) => (
              <article
                key={control.key}
                className="grid gap-3 p-4 md:grid-cols-[1fr_auto]"
              >
                <div>
                  <p className="font-medium">{control.title}</p>
                  <p className="mt-1 text-sm text-foreground/58">
                    {control.category ?? localizedCopy.emptyValue}
                  </p>
                </div>
                <span className="w-fit rounded-sm bg-surface-muted px-2 py-1 text-sm">
                  {statusLabel(control.status, localizedCopy)}
                </span>
              </article>
            ))
          ) : (
            <p className="p-4 text-sm text-foreground/58">
              {localizedCopy.noPriorityControls}
            </p>
          )}
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex items-center gap-2">
          <MessageSquareText className="h-4 w-4 text-primary" aria-hidden="true" strokeWidth={1.5} />
          <h2 className="font-medium">{localizedCopy.workspaces}</h2>
        </div>
        {workspaceProgress.map(({ progress, workspace }) => (
          <WorkspaceRenderer
            key={workspace.platformId}
            clientOrgId={orgId}
            commentsByControlKey={commentsByControlKey}
            mode="consultant_readonly"
            progress={progress}
            workspace={workspace}
          />
        ))}
      </section>
    </section>
  );
}
