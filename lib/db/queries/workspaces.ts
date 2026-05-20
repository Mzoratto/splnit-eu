import { and, desc, eq, inArray } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { controls, evidence, orgControlStatuses } from "@/lib/db/schema";
import type { EvidenceAssessmentResult, EvidenceCollectionStatus } from "@/lib/activation/evidence-state";
import type { PlatformWorkspace } from "@/lib/workspaces/types";

// Per-control evidence snapshot returned by getWorkspaceProgress.
export type WorkspaceControlProgress = {
  controlKey: string;
  hasEvidence: boolean;
  assessmentResult: EvidenceAssessmentResult;
  collectionStatus: EvidenceCollectionStatus;
  collectedAt: Date | null;
  // null means no evidence row exists at all.
  evidenceId: string | null;
};

// Per-layer rollup.
export type WorkspaceLayerProgress = {
  layerId: string;
  // Number of controls with at least one evidence row.
  completedControls: number;
  totalControls: number;
  // completedControls / totalControls, 0 when totalControls === 0.
  completionPct: number;
  controls: WorkspaceControlProgress[];
};

export type WorkspaceProgress = {
  platformId: string;
  // completedControls / totalControls across all layers.
  overallCompletionPct: number;
  completedControls: number;
  totalControls: number;
  layers: WorkspaceLayerProgress[];
};

/**
 * Returns completion state for a given org + platformId.
 *
 * layerId / platformId are not stored on evidence rows; they are derived by
 * looking up each controlKey from the static PlatformWorkspace config into
 * the DB controls table, then fetching the latest evidence per control.
 *
 * "Completed" is defined as: at least one evidence row exists for the control
 * (regardless of assessmentResult). Controls with no evidence row are treated
 * as incomplete.
 */
export async function getWorkspaceProgress(
  clerkOrgId: string,
  workspace: PlatformWorkspace,
): Promise<WorkspaceProgress> {
  const db = getDb();

  // Collect all controlKeys from the static config.
  const allControlKeys = workspace.layers.flatMap((layer) =>
    layer.controls.map((c) => c.controlKey),
  );

  if (allControlKeys.length === 0) {
    return {
      platformId: workspace.platformId,
      overallCompletionPct: 0,
      completedControls: 0,
      totalControls: 0,
      layers: workspace.layers.map((layer) => ({
        layerId: layer.id,
        completedControls: 0,
        totalControls: 0,
        completionPct: 0,
        controls: [],
      })),
    };
  }

  // Resolve controlKey → control.id from the DB.
  const controlRows = await db
    .select({ id: controls.id, key: controls.key })
    .from(controls)
    .where(inArray(controls.key, allControlKeys));

  const keyToId = new Map<string, string>(
    controlRows.map((r) => [r.key, r.id]),
  );

  const controlIds = controlRows.map((r) => r.id);

  // Fetch latest evidence per control for this org (one row per controlId,
  // ordered desc by collectedAt so we get the most recent).
  // We need all rows then pick latest in JS to avoid a lateral join.
  const evidenceRows =
    controlIds.length > 0
      ? await db
          .select({
            controlId: evidence.controlId,
            evidenceId: evidence.id,
            assessmentResult: evidence.assessmentResult,
            collectionStatus: evidence.collectionStatus,
            collectedAt: evidence.collectedAt,
          })
          .from(evidence)
          .where(
            and(
              eq(evidence.clerkOrgId, clerkOrgId),
              inArray(evidence.controlId, controlIds),
            ),
          )
          .orderBy(desc(evidence.collectedAt))
      : [];

  // Keep only the latest evidence row per controlId.
  const latestByControlId = new Map<
    string,
    {
      evidenceId: string;
      assessmentResult: EvidenceAssessmentResult;
      collectionStatus: EvidenceCollectionStatus;
      collectedAt: Date | null;
    }
  >();
  for (const row of evidenceRows) {
    if (!latestByControlId.has(row.controlId)) {
      latestByControlId.set(row.controlId, {
        evidenceId: row.evidenceId,
        assessmentResult: row.assessmentResult as EvidenceAssessmentResult,
        collectionStatus: row.collectionStatus as EvidenceCollectionStatus,
        collectedAt: row.collectedAt,
      });
    }
  }

  // Build per-layer and overall rollup by walking the static config.
  let totalCompleted = 0;
  let totalAll = 0;

  const layers: WorkspaceLayerProgress[] = workspace.layers.map((layer) => {
    const controlsProgress: WorkspaceControlProgress[] = layer.controls.map(
      (ctrl) => {
        const controlId = keyToId.get(ctrl.controlKey);
        const latest = controlId ? latestByControlId.get(controlId) : undefined;

        if (latest) {
          return {
            controlKey: ctrl.controlKey,
            hasEvidence: true,
            assessmentResult: latest.assessmentResult,
            collectionStatus: latest.collectionStatus,
            collectedAt: latest.collectedAt,
            evidenceId: latest.evidenceId,
          };
        }

        return {
          controlKey: ctrl.controlKey,
          hasEvidence: false,
          assessmentResult: "unknown" as EvidenceAssessmentResult,
          collectionStatus: "pending" as EvidenceCollectionStatus,
          collectedAt: null,
          evidenceId: null,
        };
      },
    );

    const layerCompleted = controlsProgress.filter((c) => c.hasEvidence).length;
    const layerTotal = controlsProgress.length;

    totalCompleted += layerCompleted;
    totalAll += layerTotal;

    return {
      layerId: layer.id,
      completedControls: layerCompleted,
      totalControls: layerTotal,
      completionPct: layerTotal > 0 ? layerCompleted / layerTotal : 0,
      controls: controlsProgress,
    };
  });

  return {
    platformId: workspace.platformId,
    overallCompletionPct: totalAll > 0 ? totalCompleted / totalAll : 0,
    completedControls: totalCompleted,
    totalControls: totalAll,
    layers,
  };
}
