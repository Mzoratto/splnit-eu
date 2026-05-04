"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { Icon } from "@/components/marketing/local-icon";

const links = [
  { href: "/platform", labelKey: "platform" },
  { href: "/predpisy", labelKey: "regulations" },
  { href: "/blog", labelKey: "blog" },
  { href: "/early-access", labelKey: "earlyAccess" },
  { href: "/about", labelKey: "about" },
  { href: "/cenik", labelKey: "pricing" },
];

export function Nav() {
  const pathname = usePathname();
  const t = useTranslations("marketing.nav");
  const [open, setOpen] = useState(false);
  const onEarlyAccessPage =
    pathname === "/early-access" || pathname.startsWith("/early-access/");
  const ctaClassName =
    "flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-500";
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
    <nav className="nav-blur fixed left-0 right-0 top-0 z-50 h-16 border-b border-zinc-200/60 transition-all duration-300">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-4 px-5">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2"
          onClick={() => setOpen(false)}
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 shadow-sm shadow-blue-200">
            <Icon
              icon="solar:shield-keyhole-linear"
              className="text-sm text-white"
              aria-hidden="true"
            />
          </div>
          <span className="font-semibold tracking-tight text-zinc-900">
            Splnit<span className="text-blue-600">.eu</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => {
            const active =
              pathname === link.href || pathname.startsWith(`${link.href}/`);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-zinc-100/70 hover:text-zinc-900 ${
                  active
                    ? "font-medium text-zinc-900"
                    : "font-medium text-zinc-500"
                }`}
              >
                {t(link.labelKey)}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:block">
            <LocaleSwitcher compact />
          </div>
          <Link
            href="/sign-in"
            className="hidden text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 md:block"
          >
            {t("signIn")}
          </Link>
          <div className="rounded-full bg-gradient-to-b from-blue-400 to-blue-700 p-px shadow-sm shadow-blue-200/60 transition-shadow hover:shadow-blue-200">
            {onEarlyAccessPage ? (
              <a
                href="mailto:hello@splnit.eu?subject=Design%20partner%20Splnit.eu"
                className={ctaClassName}
              >
                {ctaContent}
              </a>
            ) : (
              <Link href="/early-access" className={ctaClassName}>
                {ctaContent}
              </Link>
            )}
          </div>
          <button
            type="button"
            className="p-1 text-zinc-600 transition-colors hover:text-zinc-900 md:hidden"
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
        <div className="border-b border-zinc-200/70 bg-stone-50/95 px-5 py-4 shadow-lg shadow-zinc-200/40 backdrop-blur md:hidden">
          <div className="mx-auto grid max-w-7xl gap-1">
            {links.map((link) => {
              const active =
                pathname === link.href || pathname.startsWith(`${link.href}/`);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-xl px-3 py-3 text-sm ${
                    active
                      ? "bg-blue-50 font-medium text-blue-700"
                      : "text-zinc-600 hover:bg-white"
                  }`}
                  onClick={() => setOpen(false)}
                >
                  {t(link.labelKey)}
                </Link>
              );
            })}
            <div className="px-3 py-2">
              <LocaleSwitcher />
            </div>
            <Link
              href="/sign-in"
              className="rounded-xl px-3 py-3 text-sm text-zinc-600 hover:bg-white"
              onClick={() => setOpen(false)}
            >
              {t("signIn")}
            </Link>
          </div>
        </div>
      ) : null}
    </nav>
  );
}
