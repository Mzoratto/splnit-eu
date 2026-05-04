"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { FormEvent, useState } from "react";
import { LogoMark } from "@/components/brand/logo-mark";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { Icon } from "@/components/marketing/local-icon";

export function Footer() {
  const t = useTranslations("marketing.footer");
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
              <LogoMark />
              <span className="font-semibold tracking-tight text-zinc-900">
                Splnit<span className="text-blue-600">.eu</span>
              </span>
            </div>
            <p className="mb-5 max-w-xs text-xs leading-relaxed text-zinc-500">
              {t("tagline")}
            </p>
            <div>
              <p className="mb-2 text-xs font-semibold text-zinc-900">
                {t("newsletterTitle")}
              </p>
              {status === "success" ? (
                <p className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
                  <Icon icon="solar:check-circle-linear" aria-hidden="true" />
                  {t("newsletterSuccess")}
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
                      {status === "loading"
                        ? t("newsletterLoading")
                        : t("newsletterSubmit")}
                    </button>
                  </form>
                  {status === "error" ? (
                    <p className="text-xs text-red-600">
                      {t("newsletterError")}
                    </p>
                  ) : null}
                </div>
              )}
            </div>
          </div>

          <FooterColumn
            title={t("product")}
            links={[
              [t("monitoring"), "/platform#monitoring"],
              [t("integrations"), "/platform#integrace"],
              [t("trustCenter"), "/platform#trust-center"],
              ["Early access", "/early-access"],
              [t("about"), "/about"],
              [t("pricing"), "/cenik"],
            ]}
          />
          <FooterColumn
            title={t("regulations")}
            links={[
              ["NIS2", "/predpisy/nis2"],
              ["EU AI Act", "/predpisy/eu-ai-act"],
              ["GDPR", "/predpisy/gdpr"],
              ["ISO 27001", "/predpisy/iso-27001"],
            ]}
          />

          <div className="col-span-2 md:pl-4">
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-900">
              {t("contact")}
            </h4>
            <address className="space-y-1.5 text-xs text-zinc-500 not-italic">
              <p className="font-medium text-zinc-700">
                {t("operator")}
              </p>
              <p>{t("location")}</p>
              <p>{t("pendingEntity")}</p>
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
            {t("copyright")}
          </p>
          <div className="flex items-center gap-5 text-xs text-zinc-400">
            <Link href="/soukromi" className="transition-colors hover:text-zinc-700">
              {t("privacy")}
            </Link>
            <Link href="/podminky" className="transition-colors hover:text-zinc-700">
              {t("terms")}
            </Link>
            <Link href="/cookies" className="transition-colors hover:text-zinc-700">
              Cookies
            </Link>
            <Link href="/dpa" className="transition-colors hover:text-zinc-700">
              DPA
            </Link>
            <div className="h-3 w-px bg-zinc-200" />
            <LocaleSwitcher compact />
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
