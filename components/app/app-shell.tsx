"use client";

import { useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { GlobalSearch } from "@/components/app/global-search";
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
  isPreIntake?: boolean;
  regulationUpdateCount?: number;
  trustCenterHref: string;
};

export function AppShell({
  children,
  clerkEnabled,
  organisationName,
  plan,
  isPreIntake = false,
  regulationUpdateCount = 0,
  trustCenterHref,
}: AppShellProps) {
  const t = useTranslations("shell");
  const [freePlanBannerVisible, setFreePlanBannerVisible] = useState(true);

  return (
    <div className="min-h-screen bg-background pb-[calc(5.5rem+env(safe-area-inset-bottom))] text-foreground lg:pb-0">
      <Sidebar
        clerkEnabled={clerkEnabled}
        isPreIntake={isPreIntake}
        organisationName={organisationName}
        plan={plan}
        regulationUpdateCount={regulationUpdateCount}
      />
      <div className="lg:pl-[var(--app-sidebar-width)]">
        <header className="sticky top-0 z-[var(--z-sticky)] flex h-20 items-center justify-between border-b border-border bg-surface/90 px-4 backdrop-blur-xl sm:px-6">
          <div className="flex min-w-0 items-center gap-3 pr-3">
            <div className="min-w-0">
              <p className="truncate text-base font-semibold">{organisationName}</p>
              <p className="text-xs capitalize text-foreground/58">
                {t("plan")}: {plan}
              </p>
            </div>
            <div className="hidden sm:block">
              <OrgSwitcher enabled={clerkEnabled} />
            </div>
          </div>
          <GlobalSearch
            copy={{
              categories: {
                controls: t("searchPanel.categories.controls"),
                incidents: t("searchPanel.categories.incidents"),
                policies: t("searchPanel.categories.policies"),
                risks: t("searchPanel.categories.risks"),
                vendors: t("searchPanel.categories.vendors"),
              },
              close: t("searchPanel.close"),
              empty: t("searchPanel.empty"),
              hint: t("searchPanel.hint"),
              placeholder: t("searchPanel.placeholder"),
              trigger: t("search"),
            }}
          />
          <div className="flex items-center gap-2">
            <Link
              href={trustCenterHref}
              className="btn btn-secondary hidden h-11 px-4 sm:inline-flex"
            >
              {t("trustCenter")}
            </Link>
            <ThemeToggle />
            <UserMenu enabled={clerkEnabled} />
          </div>
        </header>
        {plan === "free" && freePlanBannerVisible ? (
          <div className="border-b border-[var(--accent-border)] bg-[var(--accent-subtle)] px-5 py-2 text-xs text-foreground/68">
            <div className="flex w-full items-center gap-3">
              <span className="min-w-0 flex-1 truncate">
                {t("freePlanBanner")}
              </span>
              <Link
                href="/settings/billing"
                className="shrink-0 text-foreground/64 underline underline-offset-4 hover:text-foreground"
              >
                {t("upgradePlan")}
              </Link>
              <button
                type="button"
                className="grid h-5 w-5 shrink-0 place-items-center rounded-sm text-foreground/42 hover:bg-bg-hover hover:text-foreground"
                aria-label={t("dismissFreePlanBanner")}
                onClick={() => setFreePlanBannerVisible(false)}
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        ) : null}
        <main className="w-full overflow-x-clip px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:pb-20">
          {children}
        </main>
      </div>
      <MobileTabBar isPreIntake={isPreIntake} regulationUpdateCount={regulationUpdateCount} />
    </div>
  );
}
