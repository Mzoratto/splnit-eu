"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Search, X } from "lucide-react";

type SearchResult = { href: string; subtitle: string | null; title: string };
type SearchGroup = {
  category: "controls" | "vendors" | "incidents" | "risks" | "policies";
  results: SearchResult[];
};

export type GlobalSearchCopy = {
  trigger: string;
  placeholder: string;
  empty: string;
  hint: string;
  close: string;
  categories: Record<SearchGroup["category"], string>;
};

export function GlobalSearch({ copy }: { copy: GlobalSearchCopy }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [groups, setGroups] = useState<SearchGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setGroups([]);
    setSearched(false);
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
      }

      if (event.key === "Escape") {
        close();
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [close]);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    abortRef.current?.abort();

    const trimmed = query.trim();

    if (trimmed.length < 2) {
      setGroups([]);
      setSearched(false);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);

    const timeout = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(trimmed)}`,
          { signal: controller.signal },
        );

        if (response.ok) {
          const data = (await response.json()) as { groups: SearchGroup[] };
          setGroups(data.groups);
          setSearched(true);
        }
      } catch {
        // aborted or network error — keep previous results
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 250);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mx-4 hidden h-11 w-full max-w-md items-center gap-2 rounded-lg border border-border bg-background px-4 text-left text-sm text-foreground/52 transition-colors hover:border-border hover:bg-bg-hover lg:flex"
      >
        <Search className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
        <span className="flex-1">{copy.trigger}</span>
        <kbd className="mono rounded border border-border px-1.5 py-0.5 text-[10px] text-foreground/42">
          ⌘K
        </kbd>
      </button>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={copy.trigger}
        className="grid h-11 w-11 place-items-center rounded-lg text-foreground/58 hover:bg-bg-hover lg:hidden"
      >
        <Search className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[var(--z-modal)] bg-[var(--bg-modal-overlay)] p-4 pt-[12vh]"
          onClick={close}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={copy.trigger}
            className="mx-auto w-full max-w-xl overflow-hidden rounded-lg border border-border bg-surface shadow-[var(--shadow-modal)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center gap-2 border-b border-border px-4">
              {loading ? (
                <Loader2
                  className="h-4 w-4 animate-spin text-foreground/42"
                  aria-hidden="true"
                  strokeWidth={1.5}
                />
              ) : (
                <Search
                  className="h-4 w-4 text-foreground/42"
                  aria-hidden="true"
                  strokeWidth={1.5}
                />
              )}
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={copy.placeholder}
                className="h-12 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-foreground/38"
              />
              <button
                type="button"
                onClick={close}
                aria-label={copy.close}
                className="grid h-7 w-7 place-items-center rounded-md text-foreground/42 hover:bg-bg-hover hover:text-foreground"
              >
                <X className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
              </button>
            </div>

            <div className="max-h-[50vh] overflow-y-auto p-2">
              {groups.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-foreground/52">
                  {searched && !loading ? copy.empty : copy.hint}
                </p>
              ) : (
                groups.map((group) => (
                  <div key={group.category} className="mb-1">
                    <p className="mono px-3 pb-1 pt-2 text-[10px] uppercase tracking-[0.08em] text-foreground/42">
                      {copy.categories[group.category]}
                    </p>
                    {group.results.map((result) => (
                      <Link
                        key={`${group.category}-${result.href}-${result.title}`}
                        href={result.href}
                        onClick={close}
                        className="block rounded-md px-3 py-2 text-sm hover:bg-bg-hover"
                      >
                        <span className="block truncate">{result.title}</span>
                        {result.subtitle ? (
                          <span className="mono block truncate text-xs text-foreground/48">
                            {result.subtitle}
                          </span>
                        ) : null}
                      </Link>
                    ))}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
