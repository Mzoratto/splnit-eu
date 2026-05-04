"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { localeCookieName, type Locale } from "@/i18n/routing";

const localeOptions: Array<{ label: string; value: Locale }> = [
  { label: "CS", value: "cs-CZ" },
  { label: "EN", value: "en-EU" },
  { label: "IT", value: "it-IT" },
];

export function LocaleSwitcher({
  compact = false,
}: {
  compact?: boolean;
}) {
  const activeLocale = useLocale();
  const router = useRouter();

  function selectLocale(locale: Locale) {
    document.cookie = `${localeCookieName}=${locale}; path=/; SameSite=Lax`;
    router.refresh();
  }

  return (
    <div
      className={`flex items-center ${
        compact ? "gap-1 text-[11px]" : "gap-1.5 text-xs"
      }`}
    >
      {localeOptions.map((option) => {
        const active = activeLocale === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => selectLocale(option.value)}
            className={`rounded-sm px-1.5 py-1 font-semibold transition-colors ${
              active
                ? "text-zinc-900"
                : "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
            }`}
            aria-pressed={active}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
