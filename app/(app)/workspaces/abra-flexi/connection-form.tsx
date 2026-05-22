"use client";

import { useActionState } from "react";
import { Loader2, PlugZap } from "lucide-react";
import {
  connectAbraFlexiAction,
  type AbraFlexiConnectionState,
} from "./actions";

type Copy = {
  baseUrl: string;
  body: string;
  companyName: string;
  connect: string;
  errors: Record<string, string>;
  password: string;
  title: string;
  username: string;
};

const initialState: AbraFlexiConnectionState = {
  error: null,
};

export function AbraFlexiConnectionForm({ copy }: { copy: Copy }) {
  const [state, formAction, pending] = useActionState(
    connectAbraFlexiAction,
    initialState,
  );
  const error = state.error ? copy.errors[state.error] ?? copy.errors.validation : null;

  return (
    <section className="rounded-lg border border-border bg-surface p-5">
      <div className="flex items-start gap-3">
        <div className="rounded-md bg-primary/10 p-2 text-primary">
          <PlugZap className="h-5 w-5" aria-hidden="true" strokeWidth={1.7} />
        </div>
        <div>
          <h2 className="text-lg font-semibold">{copy.title}</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-foreground/64">
            {copy.body}
          </p>
        </div>
      </div>

      <form action={formAction} className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="grid gap-1.5 text-sm md:col-span-2">
          <span className="font-medium text-foreground/72">{copy.baseUrl}</span>
          <input
            name="baseUrl"
            type="url"
            required
            placeholder="https://example.flexibee.eu"
            className="rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium text-foreground/72">{copy.companyName}</span>
          <input
            name="companyName"
            required
            placeholder="demo"
            className="rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium text-foreground/72">{copy.username}</span>
          <input
            name="username"
            autoComplete="username"
            required
            className="rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
        </label>
        <label className="grid gap-1.5 text-sm md:col-span-2">
          <span className="font-medium text-foreground/72">{copy.password}</span>
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
        </label>
        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={pending}
            className="btn btn-primary"
          >
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <PlugZap className="h-4 w-4" aria-hidden="true" strokeWidth={1.7} />
            )}
            {copy.connect}
          </button>
        </div>
      </form>

      {error ? (
        <p className="mt-4 rounded-md border border-[var(--status-fail-border)] bg-[var(--status-fail-subtle)] p-3 text-sm text-[var(--status-fail)]">
          {error}
        </p>
      ) : null}
    </section>
  );
}
