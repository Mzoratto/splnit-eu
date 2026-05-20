"use client";

import * as React from "react";
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleDashed,
  FileUp,
  HelpCircle,
  Info,
  Upload,
} from "lucide-react";
import clsx from "clsx";
import {
  ActivationStatus,
  deriveActivationStatusState,
} from "@/components/activation/activation-status";
import { submitWorkspaceAttestationAction } from "@/app/(app)/workspaces/actions";
import type { PlatformWorkspace, WorkspaceControl } from "@/lib/workspaces/types";
import type { WorkspaceProgress, WorkspaceControlProgress } from "@/lib/db/queries/workspaces";

// ─── Types ────────────────────────────────────────────────────────────────────

type WorkspaceRendererProps = {
  workspace: PlatformWorkspace;
  progress: WorkspaceProgress;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pct(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function controlProgress(
  controlKey: string,
  progress: WorkspaceProgress,
): WorkspaceControlProgress | null {
  for (const layer of progress.layers) {
    for (const ctrl of layer.controls) {
      if (ctrl.controlKey === controlKey) {
        return ctrl;
      }
    }
  }
  return null;
}

function layerProgress(
  layerId: string,
  progress: WorkspaceProgress,
) {
  return progress.layers.find((l) => l.layerId === layerId) ?? null;
}

// ─── Progress bar ─────────────────────────────────────────────────────────────

function LinearProgress({ value, className }: { value: number; className?: string }) {
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(value * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={clsx("h-1.5 w-full overflow-hidden rounded-full bg-border", className)}
    >
      <div
        className="h-full rounded-full bg-primary transition-all duration-300"
        style={{ width: pct(Math.min(1, value)) }}
      />
    </div>
  );
}

// ─── Attestation form ─────────────────────────────────────────────────────────

type AttestationFormProps = {
  control: WorkspaceControl;
  layerId: string;
  platformId: string;
};

function AttestationForm({ control, layerId, platformId }: AttestationFormProps) {
  const [answer, setAnswer] = React.useState<"yes" | "no" | "partial" | "">("");
  const [notes, setNotes] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!answer) return;

    setPending(true);
    setError(null);

    try {
      // When NEXT_PUBLIC_ENABLE_TEST_ROUTES is set (e.g. in Playwright E2E), use
      // the plain fetch test route so tests can mock it via page.route() without
      // needing to intercept Next.js RSC server action flight data.
      if (process.env.NEXT_PUBLIC_ENABLE_TEST_ROUTES === "true") {
        const res = await fetch("/api/test/workspace-attestation", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            answers: { answer, notes: notes.trim() || null },
            controlKey: control.controlKey,
            layerId,
            platformId,
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error((data as { error?: string }).error ?? "Submission failed.");
        }
      } else {
        await submitWorkspaceAttestationAction({
          answers: {
            answer,
            notes: notes.trim() || null,
          },
          controlKey: control.controlKey,
          layerId,
          platformId,
        });
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed.");
    } finally {
      setPending(false);
    }
  }

  if (submitted) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-[var(--status-pass-border)] bg-[var(--status-pass-subtle)] px-3 py-2 text-sm text-[var(--status-pass)]">
        <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
        Attestation saved. Reload to see updated status.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Your answer</legend>
        <div className="flex flex-wrap gap-2">
          {(["yes", "no", "partial"] as const).map((value) => (
            <label
              key={value}
              className={clsx(
                "flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm capitalize transition-colors",
                answer === value
                  ? "border-primary bg-primary/8 text-primary"
                  : "border-border bg-surface-muted text-foreground/68 hover:bg-surface",
              )}
            >
              <input
                type="radio"
                name={`attest-${control.controlKey}`}
                value={value}
                checked={answer === value}
                onChange={() => setAnswer(value)}
                className="sr-only"
              />
              {value === "yes" ? "Yes / Done" : value === "no" ? "No / Gap" : "Partial"}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="grid gap-1.5 text-sm">
        <span className="font-medium text-foreground/72">Notes (optional)</span>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Document your approach, steps taken, or caveats…"
          className="rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </label>

      {error ? (
        <p className="text-xs text-[var(--status-fail)]">{error}</p>
      ) : null}

      <button
        type="submit"
        disabled={!answer || pending}
        className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save attestation"}
        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
      </button>
    </form>
  );
}

// ─── File upload hint ─────────────────────────────────────────────────────────

function FileUploadHint({ controlKey }: { controlKey: string }) {
  return (
    <div className="flex items-start gap-2 rounded-md border border-border bg-surface-muted px-3 py-2.5 text-sm text-foreground/64">
      <FileUp className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
      <span>
        Upload evidence files via the{" "}
        <a
          href={`/controls/${controlKey}`}
          className="font-medium text-primary underline underline-offset-2 hover:opacity-80"
        >
          control detail page
        </a>
        .
      </span>
    </div>
  );
}

// ─── Control card ─────────────────────────────────────────────────────────────

type ControlCardProps = {
  control: WorkspaceControl;
  controlProg: WorkspaceControlProgress | null;
  layerId: string;
  platformId: string;
};

function ControlCard({ control, controlProg, layerId, platformId }: ControlCardProps) {
  const [open, setOpen] = React.useState(false);

  const activationState = controlProg?.hasEvidence
    ? deriveActivationStatusState({
        assessmentResult: controlProg.assessmentResult,
        collectionStatus: controlProg.collectionStatus,
        source: "manual",
      })
    : null;

  return (
    <article className="rounded-lg border border-border bg-surface">
      {/* Header row — always visible */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-start justify-between gap-4 p-4 text-left hover:bg-surface-muted"
        aria-expanded={open}
      >
        <div className="flex flex-1 flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            {/* completion indicator */}
            {controlProg?.hasEvidence ? (
              <CheckCircle2
                className="h-4 w-4 shrink-0 text-[var(--status-pass)]"
                aria-label="Evidence submitted"
              />
            ) : (
              <CircleDashed
                className="h-4 w-4 shrink-0 text-foreground/36"
                aria-label="No evidence yet"
              />
            )}
            <span className="text-sm font-medium">{control.question}</span>
          </div>

          {/* refs */}
          <div className="flex flex-wrap gap-2 pl-6">
            <span className="rounded-sm border border-border px-1.5 py-0.5 font-mono text-[11px] text-foreground/52">
              {control.nis2ArticleRef}
            </span>
            {control.zobkSectionRef ? (
              <span className="rounded-sm border border-border px-1.5 py-0.5 font-mono text-[11px] text-foreground/52">
                ZoKB {control.zobkSectionRef}
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          {activationState ? (
            <ActivationStatus
              state={activationState}
              showDetails={false}
              className="text-xs"
            />
          ) : null}
          {open ? (
            <ChevronDown className="mt-1 h-4 w-4 text-foreground/40" aria-hidden="true" />
          ) : (
            <ChevronRight className="mt-1 h-4 w-4 text-foreground/40" aria-hidden="true" />
          )}
        </div>
      </button>

      {/* Expanded detail */}
      {open ? (
        <div className="border-t border-border p-4 space-y-4">
          {/* Guidance */}
          <div className="flex gap-2 rounded-md border border-border bg-surface-muted p-3 text-sm leading-6 text-foreground/72">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            <p>{control.guidance}</p>
          </div>

          {/* Current status (if evidence exists) */}
          {controlProg?.hasEvidence && activationState ? (
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-[0.1em] text-foreground/48">
                Current evidence state
              </p>
              <ActivationStatus state={activationState} showDetails />
            </div>
          ) : null}

          {/* Evidence collection */}
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-[0.1em] text-foreground/48">
              Submit evidence
            </p>

            {/* Attestation form for attestation or both */}
            {control.evidenceType === "attestation" || control.evidenceType === "both" ? (
              <AttestationForm
                control={control}
                layerId={layerId}
                platformId={platformId}
              />
            ) : null}

            {/* File upload hint for file_upload or both */}
            {control.evidenceType === "file_upload" || control.evidenceType === "both" ? (
              <div className="space-y-1">
                {control.evidenceType === "both" ? (
                  <p className="flex items-center gap-1.5 text-xs text-foreground/52">
                    <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                    You can also attach a supporting file:
                  </p>
                ) : null}
                <FileUploadHint controlKey={control.controlKey} />
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </article>
  );
}

// ─── Layer tab button ─────────────────────────────────────────────────────────

type LayerTabProps = {
  active: boolean;
  completedControls: number;
  onClick: () => void;
  title: string;
  totalControls: number;
};

function LayerTab({ active, completedControls, onClick, title, totalControls }: LayerTabProps) {
  const done = completedControls === totalControls && totalControls > 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "flex flex-col gap-1 rounded-lg border px-4 py-3 text-left text-sm transition-colors",
        active
          ? "border-primary bg-primary/8 text-primary"
          : "border-border bg-surface text-foreground/72 hover:bg-surface-muted",
      )}
    >
      <span className={clsx("font-medium", done && !active && "text-[var(--status-pass)]")}>
        {done ? (
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            {title}
          </span>
        ) : (
          title
        )}
      </span>
      <span className="text-xs text-foreground/52">
        {completedControls}/{totalControls} controls
      </span>
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function WorkspaceRenderer({ workspace, progress }: WorkspaceRendererProps) {
  const [activeLayerIndex, setActiveLayerIndex] = React.useState(0);
  const activeLayer = workspace.layers[activeLayerIndex];
  const activeLayerProg = activeLayer ? layerProgress(activeLayer.id, progress) : null;

  if (!activeLayer) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-border p-5 text-sm text-foreground/58">
        <HelpCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
        No layers configured for this workspace.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall progress header */}
      <div className="rounded-lg border border-border bg-surface p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-foreground/48">
              {workspace.platformVendor}
            </p>
            <h2 className="mt-0.5 text-lg font-semibold">{workspace.platformName} workspace</h2>
          </div>
          <div className="text-right">
            <p className="text-2xl font-semibold tabular-nums">
              {pct(progress.overallCompletionPct)}
            </p>
            <p className="text-xs text-foreground/52">
              {progress.completedControls}/{progress.totalControls} controls completed
            </p>
          </div>
        </div>
        <LinearProgress value={progress.overallCompletionPct} className="mt-4" />
      </div>

      {/* Layer tabs */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {workspace.layers.map((layer, index) => {
          const lp = layerProgress(layer.id, progress);
          return (
            <LayerTab
              key={layer.id}
              active={index === activeLayerIndex}
              completedControls={lp?.completedControls ?? 0}
              onClick={() => setActiveLayerIndex(index)}
              title={layer.title}
              totalControls={lp?.totalControls ?? layer.controls.length}
            />
          );
        })}
      </div>

      {/* Active layer content */}
      <section aria-label={activeLayer.title}>
        {/* Layer header with progress */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-semibold">{activeLayer.title}</h3>
          {activeLayerProg ? (
            <span className="text-sm text-foreground/52">
              {pct(activeLayerProg.completionPct)} complete
            </span>
          ) : null}
        </div>
        {activeLayerProg ? (
          <LinearProgress value={activeLayerProg.completionPct} className="mb-5" />
        ) : null}

        {/* Controls list */}
        <div className="space-y-3">
          {activeLayer.controls.map((control) => {
            const cp = controlProgress(control.controlKey, progress);
            return (
              <ControlCard
                key={control.controlKey}
                control={control}
                controlProg={cp}
                layerId={activeLayer.id}
                platformId={workspace.platformId}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}
