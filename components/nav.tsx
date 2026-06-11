"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { LogoMark } from "@/components/brand/logo-mark";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { Icon } from "@/components/marketing/local-icon";
import {
  getLocalizedMarketingPath,
  toInternalMarketingPath,
} from "@/i18n/marketing-paths";
import { normalizeLocale } from "@/i18n/routing";

const links = [
  { href: "/platform", labelKey: "platform" },
  { href: "/demo", labelKey: "demo" },
  { href: "/predpisy", labelKey: "regulations" },
  { href: "/blog", labelKey: "blog" },
  { href: "/early-access", labelKey: "earlyAccess" },
  { href: "/about", labelKey: "about" },
  { href: "/cenik", labelKey: "pricing" },
];

export function Nav() {
  const pathname = usePathname();
  const locale = normalizeLocale(useLocale()) ?? "cs-CZ";
  const internalPathname = toInternalMarketingPath(pathname);
  const t = useTranslations("marketing.nav");
  const [open, setOpen] = useState(false);
  const onEarlyAccessPage =
    internalPathname === "/early-access" ||
    internalPathname.startsWith("/early-access/");
  const ctaClassName =
    "flex min-h-11 items-center gap-1.5 rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-sm)] transition-colors duration-[var(--duration-base)] hover:bg-[var(--accent-hover)] focus-visible:ring-2 focus-visible:ring-[var(--accent-border)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-brand-800)]";
  const ctaContent = (
    <>
      {t("cta")}
      <Icon
        icon="solar:arrow-right-linear"
        className="text-xs opacity-75"
        aria-hidden="true"
      />
    </>
  );

  return (
    <nav className="nav-blur fixed left-0 right-0 top-0 z-50 h-20 border-b transition-all duration-300">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-4 px-5">
        <Link
          href={getLocalizedMarketingPath("/", locale)}
          className="flex shrink-0 items-center gap-2"
          onClick={() => setOpen(false)}
        >
          <LogoMark priority className="h-8 w-8" />
          <span className="text-xl font-bold tracking-normal text-white">
            Splnit<span className="text-[var(--color-logo-green)]">.eu</span>
          </span>
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          {links.map((link) => {
            const href =
              link.href === "/demo"
                ? "/demo"
                : getLocalizedMarketingPath(link.href, locale);
            const active =
              internalPathname === link.href ||
              internalPathname.startsWith(`${link.href}/`);

            return (
              <Link
                key={link.href}
                href={href}
                className={`rounded-lg px-3 py-2 text-sm transition-colors hover:bg-white/[0.08] hover:text-white ${
                  active
                    ? "font-semibold text-white"
                    : "font-semibold text-white/62"
                }`}
              >
                {t(link.labelKey)}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:block">
            <LocaleSwitcher compact tone="dark" />
          </div>
          <Link
            href="/sign-in"
            className="hidden text-sm font-semibold text-white/70 transition-colors hover:text-white md:block"
          >
            {t("signIn")}
          </Link>
          <div>
            {onEarlyAccessPage ? (
              <a
                href="mailto:hello@splnit.eu?subject=Design%20partner%20Splnit.eu"
                className={ctaClassName}
              >
                {ctaContent}
              </a>
            ) : (
              <Link
                href={getLocalizedMarketingPath("/early-access", locale)}
                className={ctaClassName}
              >
                {ctaContent}
              </Link>
            )}
          </div>
          <button
            type="button"
            className="grid h-11 w-11 place-items-center rounded-lg border border-white/15 bg-white/10 text-white/75 transition-colors hover:text-white md:hidden"
            aria-label={t("menu")}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            <Icon
              icon={open ? "solar:close-circle-linear" : "solar:hamburger-menu-linear"}
              className="text-xl"
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-b border-white/10 bg-[var(--color-brand-800)] px-5 py-4 shadow-lg shadow-slate-950/20 backdrop-blur md:hidden">
          <div className="mx-auto grid max-w-7xl gap-1">
            {links.map((link) => {
              const href =
                link.href === "/demo"
                  ? "/demo"
                  : getLocalizedMarketingPath(link.href, locale);
              const active =
                internalPathname === link.href ||
                internalPathname.startsWith(`${link.href}/`);

              return (
                <Link
                  key={link.href}
                  href={href}
                  className={`rounded-lg px-3 py-3 text-sm ${
                    active
                      ? "bg-white/10 font-semibold text-white"
                      : "font-medium text-white/70 hover:bg-white/[0.08] hover:text-white"
                  }`}
                  onClick={() => setOpen(false)}
                >
                  {t(link.labelKey)}
                </Link>
              );
            })}
            <Link
              href="/sign-in"
              className="rounded-lg px-3 py-3 text-sm font-medium text-white/70 hover:bg-white/[0.08] hover:text-white"
              onClick={() => setOpen(false)}
            >
              {t("signIn")}
            </Link>
            <div className="mt-3 border-t border-white/10 px-3 pt-4">
              <LocaleSwitcher pill tone="dark" />
            </div>
          </div>
        </div>
      ) : null}
    </nav>
  );
}
