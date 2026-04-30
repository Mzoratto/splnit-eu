"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Icon } from "@iconify/react";

export function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");

    const response = await fetch("/api/newsletter", {
      body: JSON.stringify({ email }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (response.ok) {
      setEmail("");
      setStatus("success");
      return;
    }

    setStatus("error");
  }

  return (
    <footer className="border-t border-zinc-200 bg-white px-5 pb-10 pt-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 grid grid-cols-2 gap-8 md:grid-cols-6">
          <div className="col-span-2">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600">
                <Icon
                  icon="solar:shield-keyhole-linear"
                  className="text-sm text-white"
                  aria-hidden="true"
                />
              </div>
              <span className="font-semibold tracking-tight text-zinc-900">
                Splnit<span className="text-blue-600">.eu</span>
              </span>
            </div>
            <p className="mb-5 max-w-xs text-xs leading-relaxed text-zinc-500">
              Platforma pro automatizaci souladu s EU předpisy.
            </p>
            <div>
              <p className="mb-2 text-xs font-semibold text-zinc-900">
                Měsíční přehled EU předpisů
              </p>
              {status === "success" ? (
                <p className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
                  <Icon icon="solar:check-circle-linear" aria-hidden="true" />
                  Odebírání aktivní
                </p>
              ) : (
                <div className="space-y-2">
                  <form className="flex max-w-xs gap-2" onSubmit={handleSubmit}>
                    <input
                      type="email"
                      required
                      placeholder="Email"
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value);
                        if (status === "error") {
                          setStatus("idle");
                        }
                      }}
                      className="min-w-0 flex-1 rounded-full border border-zinc-200 px-3.5 py-1.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className="shrink-0 rounded-full bg-zinc-900 px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {status === "loading" ? "Ukládám" : "Odebírat"}
                    </button>
                  </form>
                  {status === "error" ? (
                    <p className="text-xs text-red-600">
                      Odběr se nepodařilo uložit.
                    </p>
                  ) : null}
                </div>
              )}
            </div>
          </div>

          <FooterColumn
            title="Produkt"
            links={[
              ["Monitoring", "/platform#monitoring"],
              ["Integrace", "/platform#integrace"],
              ["Trust Center", "/platform#trust-center"],
              ["Ceník", "/cenik"],
            ]}
          />
          <FooterColumn
            title="Předpisy"
            links={[
              ["NIS2", "/predpisy/nis2"],
              ["EU AI Act", "/predpisy/eu-ai-act"],
              ["GDPR", "/predpisy/gdpr"],
              ["ISO 27001", "/predpisy/iso-27001"],
            ]}
          />

          <div className="col-span-2 md:pl-4">
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-900">
              Kontakt
            </h4>
            <address className="space-y-1.5 text-xs text-zinc-500 not-italic">
              <p className="font-medium text-zinc-700">
                Splnit Technology s.r.o.
              </p>
              <p>Ostrava, Česká republika</p>
              <Link
                href="mailto:hello@splnit.eu"
                className="mt-2 inline-block font-medium text-blue-600 transition-colors hover:text-blue-700"
              >
                hello@splnit.eu
              </Link>
            </address>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-zinc-100 pt-8 md:flex-row">
          <p className="text-xs text-zinc-400">
            © 2026 Splnit Technology · Vytvořeno v Česku 🇨🇿 · Splnit
            Technology s.r.o. · Ostrava
          </p>
          <div className="flex items-center gap-5 text-xs text-zinc-400">
            <Link href="/soukromi" className="transition-colors hover:text-zinc-700">
              Privacy
            </Link>
            <Link href="/podminky" className="transition-colors hover:text-zinc-700">
              Podmínky
            </Link>
            <Link href="/cookies" className="transition-colors hover:text-zinc-700">
              Cookies
            </Link>
            <Link href="/dpa" className="transition-colors hover:text-zinc-700">
              DPA
            </Link>
            <div className="h-3 w-px bg-zinc-200" />
            <div className="flex gap-1.5">
              <span className="font-semibold text-zinc-900">CS</span>
              <span className="text-zinc-300">|</span>
              <span>EN</span>
              <span className="text-zinc-300">|</span>
              <span>DE</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: [string, string][];
}) {
  return (
    <div>
      <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-900">
        {title}
      </h4>
      <ul className="space-y-2.5 text-xs text-zinc-500">
        {links.map(([label, href]) => (
          <li key={href}>
            <Link href={href} className="transition-colors hover:text-zinc-900">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
