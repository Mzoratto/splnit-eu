"use client";

import { Trash2 } from "lucide-react";
import { deleteTrainingRecordAction } from "./actions";

export function DeleteTrainingRecordForm({
  confirmLabel,
  label,
  recordId,
}: {
  confirmLabel: string;
  label: string;
  recordId: string;
}) {
  return (
    <form
      action={deleteTrainingRecordAction}
      onSubmit={(event) => {
        if (!window.confirm(confirmLabel)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="recordId" value={recordId} />
      <button type="submit" className="btn btn-danger px-3 py-2 text-xs">
        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" strokeWidth={1.7} />
        {label}
      </button>
    </form>
  );
}
