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
import { createAgencyControlCommentAction } from "@/app/(app)/agency/actions";
import {
  createClientControlCommentAction,
  submitWorkspaceAttestationAction,
} from "@/app/(app)/workspaces/actions";
import { useTranslations } from "next-intl";
import type { ControlComment } from "@/lib/db/queries/agencies";
import type { PlatformWorkspace, WorkspaceControl } from "@/lib/workspaces/types";
import type { WorkspaceProgress, WorkspaceControlProgress } from "@/lib/db/queries/workspaces";

// ─── Types ────────────────────────────────────────────────────────────────────

type WorkspaceRendererProps = {
  clientOrgId?: string;
  commentsByControlKey?: Record<string, ControlComment[]>;
  mode?: "editable" | "consultant_readonly";
  workspace: PlatformWorkspace;
  progress: WorkspaceProgress;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pct(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function workspaceBadgeClass(platformId: string) {
  if (platformId.includes("pohoda")) return "bg-red-600";
  if (platformId.includes("abra")) return "bg-purple-600";
  if (platformId.includes("hetzner")) return "bg-orange-500";
  if (platformId.includes("aws")) return "bg-amber-500";
  if (platformId.includes("helios")) return "bg-teal-600";
  if (platformId.includes("money")) return "bg-indigo-600";
  return "bg-blue-600";
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

type StructuredFieldValue = string | boolean | "";

function initialStructuredFieldValues(control: WorkspaceControl): Record<string, StructuredFieldValue> {
  return Object.fromEntries(
    (control.evidenceFields ?? []).map((field) => [
      field.key,
      field.defaultValue ?? "",
    ]),
  );
}

function hasMissingRequiredStructuredField(
  control: WorkspaceControl,
  values: Record<string, StructuredFieldValue>,
): boolean {
  return (control.evidenceFields ?? []).some((field) => {
    if (!field.required) {
      return false;
    }

    const value = values[field.key];
    return value === "" || value === undefined || value === null;
  });
}

function structuredFieldAnswers(
  control: WorkspaceControl,
  values: Record<string, StructuredFieldValue>,
): Record<string, unknown> {
  return Object.fromEntries(
    (control.evidenceFields ?? [])
      .map((field) => [field.key, values[field.key] ?? null] as const)
      .filter(([, value]) => value !== ""),
  );
}

function AttestationForm({ control, layerId, platformId }: AttestationFormProps) {
  const t = useTranslations("workspace.attestation");
  const [answer, setAnswer] = React.useState<"yes" | "no" | "partial" | "">("");
  const [fieldValues, setFieldValues] = React.useState<Record<string, StructuredFieldValue>>(
    () => initialStructuredFieldValues(control),
  );
  const [notes, setNotes] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const missingRequiredFields = hasMissingRequiredStructuredField(control, fieldValues);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!answer || missingRequiredFields) return;

    setPending(true);
    setError(null);
    const answers = {
      answer,
      notes: notes.trim() || null,
      ...structuredFieldAnswers(control, fieldValues),
    };

    try {
      // When NEXT_PUBLIC_ENABLE_TEST_ROUTES is set (e.g. in Playwright E2E), use
      // the plain fetch test route so tests can mock it via page.route() without
      // needing to intercept Next.js RSC server action flight data.
      if (process.env.NEXT_PUBLIC_ENABLE_TEST_ROUTES === "true") {
        const res = await fetch("/api/test/workspace-attestation", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            answers,
            controlKey: control.controlKey,
            layerId,
            platformId,
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error((data as { error?: string }).error ?? t("submissionFailed"));
        }
      } else {
        await submitWorkspaceAttestationAction({
          answers,
          controlKey: control.controlKey,
          layerId,
          platformId,
        });
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("submissionFailed"));
    } finally {
      setPending(false);
    }
  }

  if (submitted) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-[var(--status-pass-border)] bg-[var(--status-pass-subtle)] px-3 py-2 text-sm text-[var(--status-pass)]">
        <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
        {t("saved")}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">{t("answer")}</legend>
        <div className="flex flex-wrap gap-2">
          {(["yes", "no", "partial"] as const).map((value) => {
            const inputId = `attest-${control.controlKey}-${value}`;

            return (
              <label
                key={value}
                htmlFor={inputId}
                className={clsx(
                  "relative flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm capitalize transition-colors",
                  answer === value
                    ? "border-primary bg-primary/8 text-primary"
                    : "border-border bg-surface-muted text-foreground/68 hover:bg-surface",
                )}
              >
                <input
                  id={inputId}
                  type="radio"
                  name={`attest-${control.controlKey}`}
                  value={value}
                  checked={answer === value}
                  onChange={() => setAnswer(value)}
                  className="absolute inset-0 cursor-pointer opacity-0"
                />
                {value === "yes" ? t("yes") : value === "no" ? t("no") : t("partial")}
              </label>
            );
          })}
        </div>
      </fieldset>

      {control.evidenceFields?.length ? (
        <fieldset className="space-y-2 rounded-md border border-border bg-surface-muted p-3">
          <legend className="px-1 text-sm font-medium">{t("additionalFields")}</legend>
          <div className="grid gap-3">
            {control.evidenceFields.map((field) => {
              const inputId = `${control.controlKey}-${field.key}`;
              const value = fieldValues[field.key] ?? "";

              if (field.type === "boolean") {
                return (
                  <div key={field.key} className="grid gap-1.5 text-sm">
                    <span className="font-medium text-foreground/72">{field.label}</span>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { key: "true", label: t("booleanYes"), value: true },
                        { key: "false", label: t("booleanNo"), value: false },
                      ].map((option) => {
                        const optionInputId = `${inputId}-${option.key}`;

                        return (
                          <label
                            key={option.key}
                            htmlFor={optionInputId}
                            className={clsx(
                              "relative flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors",
                              value === option.value
                                ? "border-primary bg-primary/8 text-primary"
                                : "border-border bg-background text-foreground/68 hover:bg-surface",
                            )}
                          >
                            <input
                              id={optionInputId}
                              type="radio"
                              name={inputId}
                              value={option.key}
                              checked={value === option.value}
                              onChange={() =>
                                setFieldValues((current) => ({
                                  ...current,
                                  [field.key]: option.value,
                                }))
                              }
                              className="absolute inset-0 cursor-pointer opacity-0"
                              required={field.required}
                            />
                            {option.label}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              }

              return (
                <label key={field.key} htmlFor={inputId} className="grid gap-1.5 text-sm">
                  <span className="font-medium text-foreground/72">{field.label}</span>
                  <input
                    id={inputId}
                    type={field.type}
                    required={field.required}
                    value={typeof value === "string" ? value : ""}
                    onChange={(event) =>
                      setFieldValues((current) => ({
                        ...current,
                        [field.key]: event.target.value,
                      }))
                    }
                    className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </label>
              );
            })}
          </div>
        </fieldset>
      ) : null}

      <label className="grid gap-1.5 text-sm">
        <span className="font-medium text-foreground/72">{t("notes")}</span>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t("notesPlaceholder")}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </label>

      {error ? (
        <p className="text-xs text-[var(--status-fail)]">{error}</p>
      ) : null}

      <button
        type="submit"
        disabled={!answer || missingRequiredFields || pending}
        className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? t("saving") : t("save")}
        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
      </button>
    </form>
  );
}

// ─── File upload hint ─────────────────────────────────────────────────────────

function FileUploadHint({ controlKey }: { controlKey: string }) {
  const t = useTranslations("workspace");

  return (
    <div className="flex items-start gap-2 rounded-md border border-border bg-surface-muted px-3 py-2.5 text-sm text-foreground/64">
      <FileUp className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
      <span>
        {t("fileUploadPrefix")}{" "}
        <a
          href={`/controls/${controlKey}`}
          className="font-medium text-primary underline underline-offset-2 hover:opacity-80"
        >
          {t("fileUploadLink")}
        </a>
        .
      </span>
    </div>
  );
}

// ─── Comments ────────────────────────────────────────────────────────────────

type CommentsPanelProps = {
  clientOrgId?: string;
  comments: ControlComment[];
  controlKey: string;
  mode: "editable" | "consultant_readonly";
};

function CommentAuthor({ authorType }: { authorType: ControlComment["authorType"] }) {
  const t = useTranslations("workspace.comments");

  return (
    <span className="rounded-sm bg-surface-muted px-1.5 py-0.5 text-[11px] font-medium text-foreground/58">
      {authorType === "consultant" ? t("consultant") : t("client")}
    </span>
  );
}

function formatCommentDate(value: Date | string | null) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function CommentsPanel({
  clientOrgId,
  comments,
  controlKey,
  mode,
}: CommentsPanelProps) {
  const t = useTranslations("workspace.comments");
  const [body, setBody] = React.useState("");
  const [isGapFlag, setIsGapFlag] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmedBody = body.trim();

    if (!trimmedBody || pending) {
      return;
    }

    setPending(true);
    setError(null);

    try {
      if (mode === "consultant_readonly") {
        if (!clientOrgId) {
          throw new Error(t("missingClient"));
        }

        await createAgencyControlCommentAction({
          body: trimmedBody,
          controlKey,
          isGapFlag,
          orgId: clientOrgId,
        });
      } else {
        await createClientControlCommentAction({
          body: trimmedBody,
          controlKey,
        });
      }

      setBody("");
      setIsGapFlag(false);
    } catch (commentError) {
      setError(
        commentError instanceof Error
          ? commentError.message
          : t("saveError"),
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-3 rounded-md border border-border bg-background p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium">{t("title")}</p>
        {comments.length ? (
          <span className="rounded-sm bg-surface-muted px-2 py-1 text-xs text-foreground/58">
            {t("count", { count: comments.length })}
          </span>
        ) : null}
      </div>

      {comments.length ? (
        <div className="space-y-2">
          {comments.map((comment) => (
            <article
              key={comment.id}
              className="rounded-md border border-border bg-surface px-3 py-2"
            >
              <div className="flex flex-wrap items-center gap-2">
                <CommentAuthor authorType={comment.authorType} />
                {comment.isGapFlag ? (
                  <span className="rounded-sm bg-[var(--status-warn-subtle)] px-1.5 py-0.5 text-[11px] font-medium text-[var(--status-warn)]">
                    {t("gapFlag")}
                  </span>
                ) : null}
                <time className="text-[11px] text-foreground/44">
                  {formatCommentDate(comment.createdAt)}
                </time>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground/72">
                {comment.body}
              </p>
            </article>
          ))}
        </div>
      ) : mode === "consultant_readonly" ? (
        <p className="text-sm text-foreground/58">{t("empty")}</p>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-2">
        <label className="grid gap-1.5 text-sm">
          <span className="sr-only">{t("placeholder")}</span>
          <textarea
            rows={3}
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder={t("placeholder")}
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm placeholder:text-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </label>

        {mode === "consultant_readonly" ? (
          <label className="inline-flex items-center gap-2 text-sm text-foreground/64">
            <input
              type="checkbox"
              checked={isGapFlag}
              onChange={(event) => setIsGapFlag(event.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            {t("markGap")}
          </label>
        ) : null}

        {error ? (
          <p className="text-xs text-[var(--status-fail)]">{error}</p>
        ) : null}

        <button
          type="submit"
          disabled={!body.trim() || pending}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? t("saving") : t("save")}
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}

// ─── Control card ─────────────────────────────────────────────────────────────

type ControlCardProps = {
  clientOrgId?: string;
  comments: ControlComment[];
  control: WorkspaceControl;
  controlProg: WorkspaceControlProgress | null;
  layerId: string;
  mode: "editable" | "consultant_readonly";
  platformId: string;
};

function ControlCard({
  clientOrgId,
  comments,
  control,
  controlProg,
  layerId,
  mode,
  platformId,
}: ControlCardProps) {
  const t = useTranslations("workspace");
  const [open, setOpen] = React.useState(false);
  const isConsultantReadonly = mode === "consultant_readonly";

  const activationState = controlProg?.hasEvidence
    ? deriveActivationStatusState({
        assessmentResult: controlProg.assessmentResult,
        collectionStatus: controlProg.collectionStatus,
        source: "manual",
      })
    : null;

  return (
    <article className="overflow-hidden rounded-lg border border-border bg-white shadow-xs">
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
            {comments.length ? (
              <span className="rounded-sm bg-primary/10 px-1.5 py-0.5 text-[11px] font-medium text-primary">
                {t("comments.count", { count: comments.length })}
              </span>
            ) : null}
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
        <div className="space-y-4 border-t border-border bg-slate-50/60 p-4">
          {/* Guidance */}
          <div className="flex gap-2 rounded-md border border-border bg-surface-muted p-3 text-sm leading-6 text-foreground/72">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            <p>{control.guidance}</p>
          </div>

          {/* Current status (if evidence exists) */}
          {controlProg?.hasEvidence && activationState ? (
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-[0.1em] text-foreground/48">
                {t("currentEvidenceState")}
              </p>
              <ActivationStatus state={activationState} showDetails />
            </div>
          ) : null}

          {/* Evidence collection */}
          {isConsultantReadonly || comments.length ? (
            <CommentsPanel
              clientOrgId={clientOrgId}
              comments={comments}
              controlKey={control.controlKey}
              mode={mode}
            />
          ) : null}

          {isConsultantReadonly ? (
            <div className="rounded-md border border-border bg-surface-muted px-3 py-2.5 text-sm leading-6 text-foreground/64">
              {t("readOnly.controlNotice")}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-[0.1em] text-foreground/48">
                {t("submitEvidence")}
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
                      {t("canAttachFile")}
                    </p>
                  ) : null}
                  <FileUploadHint controlKey={control.controlKey} />
                </div>
              ) : null}
            </div>
          )}
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

export function WorkspaceRenderer({
  clientOrgId,
  commentsByControlKey = {},
  mode = "editable",
  workspace,
  progress,
}: WorkspaceRendererProps) {
  const t = useTranslations("workspace");
  const [activeLayerIndex, setActiveLayerIndex] = React.useState(0);
  const activeLayer = workspace.layers[activeLayerIndex];
  const activeLayerProg = activeLayer ? layerProgress(activeLayer.id, progress) : null;

  if (!activeLayer) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-border p-5 text-sm text-foreground/58">
        <HelpCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
        {t("emptyLayers")}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {mode === "consultant_readonly" ? (
        <div className="rounded-lg border border-primary/25 bg-primary/8 p-4 text-sm leading-6 text-foreground/72">
          <p className="font-medium text-primary">{t("readOnly.title")}</p>
          <p className="mt-1">{t("readOnly.body")}</p>
        </div>
      ) : null}

      {/* Overall progress header */}
      <div className="rounded-lg border border-border bg-white p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <span className={`grid h-12 w-12 place-items-center rounded-lg text-sm font-bold text-white ${workspaceBadgeClass(workspace.platformId)}`}>
              {workspace.platformName.slice(0, 2).toUpperCase()}
            </span>
            <div>
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-foreground/48">
              {workspace.platformVendor}
            </p>
            <h2 className="mt-0.5 text-lg font-semibold">
              {t("workspaceTitle", { platform: workspace.platformName })}
            </h2>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-semibold tabular-nums">
              {pct(progress.overallCompletionPct)}
            </p>
            <p className="text-xs text-foreground/52">
              {t("controlsCompleted", {
                completed: progress.completedControls,
                total: progress.totalControls,
              })}
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
              {t("layerComplete", { progress: pct(activeLayerProg.completionPct) })}
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
              clientOrgId={clientOrgId}
              comments={commentsByControlKey[control.controlKey] ?? []}
              control={control}
              controlProg={cp}
              layerId={activeLayer.id}
              mode={mode}
              platformId={workspace.platformId}
            />
            );
          })}
        </div>
      </section>
    </div>
  );
}
