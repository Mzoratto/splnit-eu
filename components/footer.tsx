"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { FormEvent, useState } from "react";
import { LogoMark } from "@/components/brand/logo-mark";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { Icon } from "@/components/marketing/local-icon";
import { getLocalizedMarketingPath } from "@/i18n/marketing-paths";
import { normalizeLocale, type Locale } from "@/i18n/routing";

export function Footer() {
  const locale = normalizeLocale(useLocale()) ?? "cs-CZ";
  const t = useTranslations("marketing.footer");
  const navT = useTranslations("marketing.nav");
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
    <footer className="border-t border-border bg-white px-5 pb-10 pt-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 grid grid-cols-2 gap-10 md:grid-cols-6">
          <div className="col-span-2">
            <div className="mb-4 flex items-center gap-2">
              <LogoMark className="h-8 w-8" />
              <span className="text-xl font-bold tracking-normal text-foreground">
                Splnit<span className="text-blue-600">.eu</span>
              </span>
            </div>
            <p className="mb-5 max-w-xs text-sm leading-6 text-foreground/62">
              {t("tagline")}
            </p>
            <div>
              <p className="mb-2 text-xs font-bold uppercase text-foreground">
                {t("newsletterTitle")}
              </p>
              {status === "success" ? (
                <p className="inline-flex items-center gap-1.5 rounded-full border border-[var(--status-pass-border)] bg-[var(--status-pass-subtle)] px-3 py-1.5 text-xs font-semibold text-[var(--status-pass)]">
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
                      className="min-h-10 min-w-0 flex-1 rounded-lg border border-border px-3.5 py-2 text-sm text-foreground placeholder:text-foreground/38 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className="min-h-10 shrink-0 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {status === "loading"
                        ? t("newsletterLoading")
                        : t("newsletterSubmit")}
                    </button>
                  </form>
                  {status === "error" ? (
                    <p className="text-xs text-status-fail">
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
              [t("integrations"), "/platform#integrations"],
              [t("trustCenter"), "/platform#trust-center"],
              [t("security"), "/security"],
              [t("status"), "/status"],
              [navT("earlyAccess"), "/early-access"],
              [t("about"), "/about"],
              [t("pricing"), "/cenik"],
            ]}
            locale={locale}
          />
          <FooterColumn
            title={t("regulations")}
            links={[
              ["NIS2", "/predpisy/nis2"],
              ["EU AI Act", "/predpisy/eu-ai-act"],
              ["GDPR", "/predpisy/gdpr"],
              ["ISO 27001", "/predpisy/iso-27001"],
            ]}
            locale={locale}
          />

          <div className="col-span-2 md:pl-4">
            <h4 className="mb-4 text-xs font-bold uppercase tracking-normal text-foreground">
              {t("contact")}
            </h4>
            <address className="space-y-1.5 text-sm text-foreground/58 not-italic">
              <p className="font-semibold text-foreground/78">
                {t("operator")}
              </p>
              <p>{t("location")}</p>
              <Link
                href="mailto:hello@splnit.eu"
                className="mt-2 inline-block font-semibold text-primary transition-colors hover:text-[var(--accent-hover)]"
              >
                hello@splnit.eu
              </Link>
            </address>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
          <p className="text-xs text-foreground/45">
            {t("copyright")}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-5 text-xs text-foreground/50">
            <Link href="/soukromi" className="transition-colors hover:text-foreground">
              {t("privacy")}
            </Link>
            <Link href="/podminky" className="transition-colors hover:text-foreground">
              {t("terms")}
            </Link>
            <Link href="/cookies" className="transition-colors hover:text-foreground">
              Cookies
            </Link>
            <Link href="/dpa" className="transition-colors hover:text-foreground">
              DPA
            </Link>
            <div className="h-3 w-px bg-border" />
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
  locale,
}: {
  title: string;
  links: [string, string][];
  locale: Locale;
}) {
  return (
    <div>
      <h4 className="mb-4 text-xs font-bold uppercase tracking-normal text-foreground">
        {title}
      </h4>
      <ul className="space-y-2.5 text-sm text-foreground/58">
        {links.map(([label, href]) => (
          <li key={href}>
            <Link
              href={getLocalizedMarketingPath(href, locale)}
              className="transition-colors hover:text-foreground"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
