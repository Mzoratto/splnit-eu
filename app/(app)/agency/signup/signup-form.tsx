"use client";

import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { startAgencySignupAction, type AgencySignupState } from "./actions";

type SignupCopy = {
  continue: string;
  duplicateSlug: string;
  genericError: string;
  invalid: string;
  name: string;
  slug: string;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground enabled:hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45"
    >
      {label}
    </button>
  );
}

export function AgencySignupForm({
  copy,
  initialName,
}: {
  copy: SignupCopy;
  initialName: string;
}) {
  const initialSlug = useMemo(() => slugify(initialName), [initialName]);
  const [state, action] = useActionState<AgencySignupState, FormData>(
    startAgencySignupAction,
    {},
  );
  const [name, setName] = useState(initialName);
  const [slug, setSlug] = useState(initialSlug);
  const [slugEdited, setSlugEdited] = useState(false);
  const errorMessage =
    state.error === "duplicate_slug"
      ? copy.duplicateSlug
      : state.error === "invalid"
        ? copy.invalid
        : state.error
          ? copy.genericError
          : null;

  return (
    <form action={action} className="max-w-xl space-y-4 rounded-lg border border-border bg-surface p-5">
      {errorMessage ? (
        <p className="rounded-md border border-[var(--status-fail-border)] bg-[var(--status-fail-subtle)] p-3 text-sm text-[var(--status-fail)]">
          {errorMessage}
        </p>
      ) : null}
      <label className="grid gap-1.5 text-sm">
        {copy.name}
        <input
          name="name"
          required
          value={name}
          onChange={(event) => {
            const nextName = event.target.value;
            setName(nextName);

            if (!slugEdited) {
              setSlug(slugify(nextName));
            }
          }}
          className="rounded-md border border-border bg-background px-3 py-2"
        />
      </label>
      <label className="grid gap-1.5 text-sm">
        {copy.slug}
        <input
          name="slug"
          required
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
          value={slug}
          onChange={(event) => {
            setSlugEdited(true);
            setSlug(slugify(event.target.value));
          }}
          className="rounded-md border border-border bg-background px-3 py-2 font-mono text-sm"
        />
      </label>
      <SubmitButton label={copy.continue} />
    </form>
  );
}
