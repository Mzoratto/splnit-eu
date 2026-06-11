"use client";

import { useState } from "react";

const labels = ["NIS2", "EU AI Act", "GDPR", "ISO 27001", "CSRD", "DORA"];

export function RegulationSelector() {
  const [active, setActive] = useState("NIS2");

  function select(label: string) {
    setActive(label);
    const id = label.toLowerCase().replaceAll(" ", "-");
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="mt-8 flex flex-wrap justify-center gap-2.5">
      {labels.map((label) => (
        <button
          key={label}
          type="button"
          className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
            active === label
              ? "border-[var(--accent)] bg-[var(--accent)] text-white"
              : "border-zinc-200 bg-white text-zinc-600 hover:border-[var(--color-green-200)]"
          }`}
          onClick={() => select(label)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
