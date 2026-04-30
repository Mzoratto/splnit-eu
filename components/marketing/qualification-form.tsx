"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";

const industries = ["Technologie", "Výroba", "Finance", "Jiné"];
const sizes = ["1–49", "50–249", "250+"];
const frameworks = ["NIS2", "EU AI Act", "GDPR", "ISO 27001"];

export function QualificationForm() {
  const [industry, setIndustry] = useState("Technologie");
  const [size, setSize] = useState("50–249");
  const [framework, setFramework] = useState("NIS2");
  const [submitted, setSubmitted] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  const recommendation =
    framework === "NIS2" || size !== "1–49"
      ? `Začněte NIS2 gap analýzou pro odvětví ${industry.toLowerCase()}.`
      : `Začněte přehledem ${framework} a základním evidence vaultem.`;

  return (
    <div className="rounded-[2rem] border border-blue-100 bg-blue-50/40 p-8 md:p-10">
      <h3 className="text-2xl font-semibold tracking-[-0.03em] text-zinc-900">
        Jsme podobní těmto firmám?
      </h3>
      <form className="mt-8 grid gap-5" onSubmit={submit}>
        <Segmented
          label="Odvětví"
          options={industries}
          value={industry}
          onChange={setIndustry}
        />
        <Segmented
          label="Počet zaměstnanců"
          options={sizes}
          value={size}
          onChange={setSize}
        />
        <Segmented
          label="Prioritní předpis"
          options={frameworks}
          value={framework}
          onChange={setFramework}
        />
        <button
          type="submit"
          className="w-fit rounded-full bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500"
        >
          Zobrazit doporučení
        </button>
      </form>
      {submitted ? (
        <div className="mt-6 rounded-2xl border border-emerald-100 bg-white p-5">
          <div className="flex items-start gap-3">
            <Icon
              icon="solar:check-circle-linear"
              className="mt-0.5 text-xl text-emerald-500"
              aria-hidden="true"
            />
            <div>
              <p className="text-sm font-semibold text-zinc-900">
                Doporučení pro váš profil
              </p>
              <p className="mt-1 text-sm text-zinc-500">{recommendation}</p>
              <Link
                href="/sign-up"
                className="mt-4 inline-flex text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Zahájit zdarma →
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Segmented({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-zinc-700">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              value === option
                ? "border-blue-600 bg-blue-600 text-white"
                : "border-zinc-200 bg-white text-zinc-600 hover:border-blue-200"
            }`}
            onClick={() => onChange(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
