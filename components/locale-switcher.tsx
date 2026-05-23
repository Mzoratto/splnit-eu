"use client";

import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import { getLocalizedMarketingPath } from "@/i18n/marketing-paths";
import { localeCookieName, type Locale } from "@/i18n/routing";

const localeOptions: Array<{ label: string; lang: string; value: Locale }> = [
  { label: "CS", lang: "cs", value: "cs-CZ" },
  { label: "EN", lang: "en", value: "en-EU" },
  { label: "IT", lang: "it", value: "it-IT" },
];

export function LocaleSwitcher({
  compact = false,
  pill = false,
  tone = "light",
}: {
  compact?: boolean;
  pill?: boolean;
  tone?: "dark" | "light";
}) {
  const activeLocale = useLocale();
  const pathname = usePathname();

  function selectLocale(locale: Locale) {
    const maxAge = 60 * 60 * 24 * 365;
    const basePath = getLocalizedMarketingPath(pathname, locale);
    const target = `${basePath}${window.location.search}${window.location.hash}`;

    document.cookie = `${localeCookieName}=${locale}; path=/; max-age=${maxAge}; SameSite=Lax`;
    window.localStorage.setItem("splnit_locale", locale);

    if (target === `${window.location.pathname}${window.location.search}${window.location.hash}`) {
      window.location.reload();
      return;
    }

    window.location.assign(target);
  }

  return (
    <div
      className={`flex items-center ${
        compact ? "gap-1 text-[11px]" : "gap-1.5 text-xs"
      }`}
    >
      {localeOptions.map((option, index) => {
        const active = activeLocale === option.value;
        const buttonClassName = pill
          ? `rounded-full border px-4 py-2 font-semibold transition-colors ${
              active
                ? "border-[var(--color-brand-400)] bg-[var(--color-brand-100)] text-[var(--color-brand-700)]"
                : tone === "dark"
                  ? "border-white/15 text-white/60 hover:border-white/30 hover:text-white"
                  : "border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-800"
            }`
          : `rounded-sm px-1.5 py-1 font-semibold transition-colors ${
              active
                ? tone === "dark"
                  ? "text-white underline underline-offset-2"
                  : "text-[var(--color-brand-700)] underline underline-offset-2"
                : tone === "dark"
                  ? "text-white/50 hover:text-white/90"
                  : "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
            }`;

        return (
          <span key={option.value} className="inline-flex items-center gap-1">
            <button
              type="button"
              onClick={() => selectLocale(option.value)}
              className={buttonClassName}
              aria-current={active ? "true" : undefined}
              aria-pressed={active}
              lang={option.lang}
            >
              {option.label}
            </button>
            {!pill && index < localeOptions.length - 1 ? (
              <span
                aria-hidden="true"
                className={tone === "dark" ? "text-white/20" : "text-zinc-300"}
              >
                |
              </span>
            ) : null}
          </span>
        );
      })}
    </div>
  );
}
