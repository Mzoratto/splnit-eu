"use client";

import Link from "next/link";
import { Bell, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { OrgSwitcher } from "@/components/app/org-switcher";
import { MobileTabBar, Sidebar } from "@/components/app/sidebar";
import { ThemeToggle } from "@/components/app/theme-toggle";
import { UserMenu } from "@/components/app/user-menu";
import type { PlanKey } from "@/lib/stripe/plans";

type AppShellProps = {
  children: React.ReactNode;
  clerkEnabled: boolean;
  organisationName: string;
  plan: PlanKey;
  regulationUpdateCount?: number;
};

export function AppShell({
  children,
  clerkEnabled,
  organisationName,
  plan,
  regulationUpdateCount = 0,
}: AppShellProps) {
  const t = useTranslations("shell");

  return (
    <div className="min-h-screen bg-background pb-[calc(5.5rem+env(safe-area-inset-bottom))] text-foreground lg:pb-0">
      <Sidebar regulationUpdateCount={regulationUpdateCount} />
      <div className="lg:pl-[220px]">
        <header className="sticky top-0 z-[var(--z-sticky)] flex h-14 items-center justify-between border-b border-border bg-surface/85 px-4 backdrop-blur-xl sm:px-5">
          <div className="flex min-w-0 items-center gap-3 pr-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{organisationName}</p>
              <p className="text-xs capitalize text-foreground/58">
                {t("plan")}: {plan}
              </p>
            </div>
            <div className="hidden sm:block">
              <OrgSwitcher enabled={clerkEnabled} />
            </div>
          </div>
          <label className="mx-4 hidden h-9 w-full max-w-80 items-center gap-2 rounded-md border border-border bg-background px-3 text-sm text-foreground/52 lg:flex">
            <Search className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
            <span>{t("search")}</span>
          </label>
          <div className="flex items-center gap-2">
            <Link
              href="/trust/demo"
              className="btn btn-secondary hidden h-9 px-3 sm:inline-flex"
            >
              {t("trustCenter")}
            </Link>
            <button
              type="button"
              className="btn btn-ghost h-9 w-9 px-0"
              aria-label={t("notifications")}
            >
              <Bell className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
            </button>
            <ThemeToggle />
            <UserMenu enabled={clerkEnabled} />
          </div>
        </header>
        {plan === "free" ? (
          <div className="border-b border-[var(--status-warn-border)] bg-[var(--status-warn-subtle)] px-5 py-3 text-sm text-[var(--status-warn)]">
            <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span>
                {t("freePlanBanner")}
              </span>
              <Link
                href="/settings/billing"
                className="font-medium text-[var(--status-warn)] underline underline-offset-4"
              >
                {t("upgradePlan")}
              </Link>
            </div>
          </div>
        ) : null}
        <main className="w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:pb-20">
          {children}
        </main>
      </div>
      <MobileTabBar regulationUpdateCount={regulationUpdateCount} />
    </div>
  );
}
