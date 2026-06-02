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
  const currentYear = new Date().getFullYear();
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
    <footer className="border-t border-white/10 bg-[var(--color-brand-900)] px-5 pb-10 pt-16 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 grid grid-cols-2 gap-10 md:grid-cols-6">
          <div className="col-span-2">
            <div className="mb-4 flex items-center gap-2">
              <LogoMark className="h-8 w-8" />
              <span className="text-xl font-bold tracking-normal text-white">
                Splnit<span className="text-[var(--color-logo-green)]">.eu</span>
              </span>
            </div>
            <p className="mb-5 max-w-xs text-sm leading-6 text-white/62">
              {t("tagline")}
            </p>
            <div>
              <p className="mb-2 text-xs font-bold uppercase text-white">
                {t("newsletterTitle")}
              </p>
              <div className="space-y-2">
                <form className="flex max-w-xs gap-2" onSubmit={handleSubmit}>
                  <label htmlFor="footer-newsletter-email" className="sr-only">
                    {t("newsletterTitle")}
                  </label>
                  <input
                    id="footer-newsletter-email"
                    type="email"
                    required
                    placeholder="Email"
                    value={email}
                    aria-describedby="footer-newsletter-status"
                    aria-invalid={status === "error"}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      if (status === "error") {
                        setStatus("idle");
                      }
                    }}
                    className="min-h-10 min-w-0 flex-1 rounded-lg border border-white/15 bg-white/10 px-3.5 py-2 text-sm text-white placeholder:text-white/38 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-400)]"
                  />
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="min-h-10 shrink-0 rounded-lg bg-[var(--color-brand-700)] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[var(--color-brand-600)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {status === "loading"
                      ? t("newsletterLoading")
                      : t("newsletterSubmit")}
                  </button>
                </form>
                <p
                  id="footer-newsletter-status"
                  role={status === "error" ? "alert" : "status"}
                  aria-live={status === "error" ? "assertive" : "polite"}
                  className={
                    status === "success"
                      ? "inline-flex items-center gap-1.5 rounded-full border border-[var(--status-pass-border)] bg-[var(--status-pass-subtle)] px-3 py-1.5 text-xs font-semibold text-[var(--status-pass)]"
                      : status === "error"
                        ? "text-xs text-[var(--status-fail)]"
                        : "sr-only"
                  }
                >
                  {status === "success" ? (
                    <Icon icon="solar:check-circle-linear" aria-hidden="true" />
                  ) : null}
                  {status === "success"
                    ? t("newsletterSuccess")
                    : status === "error"
                      ? t("newsletterError")
                      : status === "loading"
                        ? t("newsletterLoading")
                        : ""}
                </p>
              </div>
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
            <h4 className="mb-4 text-xs font-bold uppercase tracking-normal text-white">
              {t("contact")}
            </h4>
            <address className="space-y-1.5 text-sm text-white/58 not-italic">
              <p className="font-semibold text-white/78">
                {t("operator")}
              </p>
              <p>{t("location")}</p>
              <Link
                href="mailto:hello@splnit.eu"
                className="mt-2 inline-block font-semibold text-[var(--color-brand-400)] transition-colors hover:text-white"
              >
                hello@splnit.eu
              </Link>
            </address>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8">
          <div className="mb-5 flex flex-wrap justify-center gap-2 md:justify-start">
            {["GDPR", "NIS2", "ISO 27001", "Vyhl. č. 410/2025 Sb."].map((label) => (
              <span
                key={label}
                className="rounded border border-white/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-normal text-white/40"
              >
                {label}
              </span>
            ))}
          </div>
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-xs text-white/45">
              © {currentYear} Splnit · Všechna práva vyhrazena
            </p>
            <div className="flex flex-wrap items-center justify-center gap-5 text-xs text-white/50">
              <Link href="/soukromi" className="transition-colors hover:text-white">
                {t("privacy")}
              </Link>
              <Link href="/podminky" className="transition-colors hover:text-white">
                {t("terms")}
              </Link>
              <Link href="/cookies" className="transition-colors hover:text-white">
                Cookies
              </Link>
              <Link href="/dpa" className="transition-colors hover:text-white">
                DPA
              </Link>
              <div className="h-3 w-px bg-white/15" />
              <LocaleSwitcher compact tone="dark" />
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
  locale,
}: {
  title: string;
  links: [string, string][];
  locale: Locale;
}) {
  return (
    <div>
      <h4 className="mb-4 text-xs font-bold uppercase tracking-normal text-white">
        {title}
      </h4>
      <ul className="space-y-2.5 text-sm text-white/58">
        {links.map(([label, href]) => (
          <li key={href}>
            <Link
              href={getLocalizedMarketingPath(href, locale)}
              className="transition-colors hover:text-white"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
