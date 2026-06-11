"use client";

import { useState, useTransition } from "react";
import type { PrehledStatus } from "@/lib/regulations/vbo-n/prehled";

export type PrehledEntryFormCopy = {
  statuses: Record<PrehledStatus, string>;
  priorities: Record<"vysoka" | "stredni" | "nizka", string>;
  fields: {
    implementationNote: string;
    plannedDate: string;
    priority: string;
    responsiblePerson: string;
    justification: string;
  };
  save: string;
  saved: string;
  selectStatus: string;
};

export function PrehledEntryForm({
  baselineId,
  allowedStatuses,
  initial,
  copy,
  action,
}: {
  baselineId: string;
  allowedStatuses: PrehledStatus[];
  initial: {
    status: PrehledStatus | null;
    implementationNote: string | null;
    plannedDate: string | null;
    priority: string | null;
    responsiblePerson: string | null;
    justification: string | null;
  };
  copy: PrehledEntryFormCopy;
  action: (formData: FormData) => Promise<void>;
}) {
  const [status, setStatus] = useState<PrehledStatus | "">(initial.status ?? "");
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        await action(formData);
        setSavedAt(Date.now());
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Uložení selhalo.");
      }
    });
  }

  const inputClass =
    "rounded-md border border-border bg-background px-2.5 py-1.5 text-sm";

  return (
    <form action={handleSubmit} className="mt-2 grid gap-2">
      <input type="hidden" name="baselineId" value={baselineId} />
      <div className="flex flex-wrap items-center gap-2">
        <select
          name="status"
          required
          value={status}
          onChange={(event) => setStatus(event.target.value as PrehledStatus | "")}
          className={inputClass}
        >
          <option value="" disabled>
            {copy.selectStatus}
          </option>
          {allowedStatuses.map((value) => (
            <option key={value} value={value}>
              {copy.statuses[value]}
            </option>
          ))}
        </select>

        {status === "zavedeno" ? (
          <input
            name="implementationNote"
            required
            placeholder={copy.fields.implementationNote}
            defaultValue={initial.implementationNote ?? ""}
            className={`${inputClass} min-w-0 flex-1`}
          />
        ) : null}

        {status === "planovano" ? (
          <>
            <input
              name="plannedDate"
              type="date"
              required
              aria-label={copy.fields.plannedDate}
              defaultValue={initial.plannedDate ?? ""}
              className={inputClass}
            />
            <select
              name="priority"
              required
              defaultValue={initial.priority ?? ""}
              aria-label={copy.fields.priority}
              className={inputClass}
            >
              <option value="" disabled>
                {copy.fields.priority}
              </option>
              {(["vysoka", "stredni", "nizka"] as const).map((value) => (
                <option key={value} value={value}>
                  {copy.priorities[value]}
                </option>
              ))}
            </select>
            <input
              name="responsiblePerson"
              required
              placeholder={copy.fields.responsiblePerson}
              defaultValue={initial.responsiblePerson ?? ""}
              className={`${inputClass} min-w-0 flex-1`}
            />
          </>
        ) : null}

        {status === "nezavedeno" ? (
          <input
            name="justification"
            required
            placeholder={copy.fields.justification}
            defaultValue={initial.justification ?? ""}
            className={`${inputClass} min-w-0 flex-1`}
          />
        ) : null}

        <button
          type="submit"
          disabled={pending || !status}
          className="btn btn-secondary h-9 px-3"
        >
          {copy.save}
        </button>
        {savedAt && !pending && !error ? (
          <span className="text-xs text-[var(--status-pass)]">{copy.saved}</span>
        ) : null}
      </div>
      {error ? (
        <p className="text-xs text-[var(--status-fail)]" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}
