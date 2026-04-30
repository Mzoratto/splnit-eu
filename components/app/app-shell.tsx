import Link from "next/link";
import { OrgSwitcher } from "@/components/app/org-switcher";
import { MobileTabBar, Sidebar } from "@/components/app/sidebar";
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
  return (
    <div className="min-h-screen bg-background pb-20 text-foreground lg:pb-0">
      <Sidebar regulationUpdateCount={regulationUpdateCount} />
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-surface/92 px-5 backdrop-blur">
          <div>
            <p className="text-sm font-medium">{organisationName}</p>
            <p className="text-xs capitalize text-foreground/58">Plan: {plan}</p>
          </div>
          <div className="flex items-center gap-3">
            <OrgSwitcher enabled={clerkEnabled} />
            <Link
              href="/trust/demo"
              className="hidden rounded-md border border-border px-3 py-2 text-sm hover:bg-surface-muted sm:inline-flex"
            >
              Trust Center
            </Link>
          </div>
        </header>
        {plan === "free" ? (
          <div className="border-b border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-900">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span>
                Bezplatný plán je aktivní. Business funkce se odemknou po upgradu.
              </span>
              <Link
                href="/settings/billing"
                className="font-medium text-amber-950 underline underline-offset-4"
              >
                Upgradovat plán
              </Link>
            </div>
          </div>
        ) : null}
        <main className="mx-auto w-full max-w-7xl px-5 py-8">{children}</main>
      </div>
      <MobileTabBar regulationUpdateCount={regulationUpdateCount} />
    </div>
  );
}
