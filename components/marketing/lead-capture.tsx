"use client";

import { useTranslations } from "next-intl";
import { FormEvent, useState } from "react";
import { Icon } from "@/components/marketing/local-icon";

const options = [
  ["GDPR", "solar:shield-user-linear"],
  ["NIS2", "solar:server-square-linear"],
  ["ISO 27001", "solar:document-text-linear"],
  ["EU AI Act", "solar:cpu-bolt-linear"],
  ["CSRD", "solar:leaf-linear"],
] as const;

export function LeadCapture({
  title,
  subtitle,
  cta,
  resources,
}: {
  title?: string;
  subtitle?: string;
  cta?: string;
  resources?: string[];
}) {
  const t = useTranslations("leadCapture");
  const [selected, setSelected] = useState<string[]>(["GDPR", "NIS2"]);
  const [submitted, setSubmitted] = useState(false);
  const resolvedTitle = title ?? t("title");
  const resolvedSubtitle = subtitle ?? t("subtitle");
  const resolvedCta = cta ?? t("cta");

  function toggle(value: string) {
    setSelected((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="rounded-[2rem] border border-blue-100 bg-blue-50/40 p-8 text-center md:p-14">
      <div className="section-tag mx-auto mb-5 w-fit">
        <Icon icon="solar:clipboard-check-linear" aria-hidden="true" />
        {t("tag")}
      </div>
      <h3 className="mb-2 text-2xl font-semibold tracking-[-0.03em] text-zinc-900 md:text-3xl">
        {resolvedTitle}
      </h3>
      <p className="mb-8 text-sm text-zinc-500">{resolvedSubtitle}</p>

      {resources ? (
        <div className="mb-8 flex flex-wrap justify-center gap-2.5">
          {resources.map((resource) => (
            <span
              key={resource}
              className="rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-medium text-zinc-700"
            >
              {resource}
            </span>
          ))}
        </div>
      ) : (
        <div className="mb-8 flex flex-wrap justify-center gap-2.5">
          {options.map(([label, icon]) => {
            const active = selected.includes(label);

            return (
              <button
                key={label}
                type="button"
                className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                  active
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-zinc-200 bg-white text-zinc-600 hover:border-blue-200"
                }`}
                onClick={() => toggle(label)}
              >
                <Icon icon={icon} className="text-sm" aria-hidden="true" />
                {label}
              </button>
            );
          })}
        </div>
      )}

      {submitted ? (
        <div className="mx-auto flex max-w-md items-center justify-center gap-1.5 rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
          <Icon icon="solar:check-circle-linear" aria-hidden="true" />
          {t("success")}
        </div>
      ) : (
        <form
          className="mx-auto flex max-w-md flex-col justify-center gap-2.5 sm:flex-row"
          onSubmit={handleSubmit}
        >
          <input
            type="email"
            required
            placeholder={t("placeholder")}
            className="min-w-0 flex-1 rounded-full border border-zinc-200 bg-white px-5 py-2.5 text-sm text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="rounded-full bg-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:scale-[1.02] hover:bg-blue-500 hover:shadow-md active:scale-[0.98]"
          >
            {resolvedCta}
          </button>
        </form>
      )}
      <p className="mt-3 text-xs text-zinc-400">
        {t("footnote")}
      </p>
    </div>
  );
}
