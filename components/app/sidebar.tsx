"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@clerk/nextjs";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { LogoMark } from "@/components/brand/logo-mark";
import {
  AlertTriangle,
  BarChart3,
  BriefcaseBusiness,
  BookOpenCheck,
  Boxes,
  FileQuestion,
  FileArchive,
  GraduationCap,
  Landmark,
  LayoutDashboard,
  LogOut,
  MoreHorizontal,
  Plug,
  ScrollText,
  Settings,
  Users,
} from "lucide-react";
import type { PlanKey } from "@/lib/stripe/plans";

const navigation = [
  {
    items: [
      { href: "/dashboard", labelKey: "dashboard", icon: LayoutDashboard },
      { href: "/frameworks", labelKey: "frameworks", icon: Landmark },
      { href: "/controls", labelKey: "controls", icon: BookOpenCheck },
      { href: "/evidence", labelKey: "evidence", icon: FileArchive },
      { href: "/training", labelKey: "training", icon: GraduationCap },
    ],
    sectionKey: "overview",
  },
  {
    items: [
      { href: "/integrations", labelKey: "integrations", icon: Plug, lockedUntilIntake: true },
      { href: "/policies", labelKey: "policies", icon: ScrollText, lockedUntilIntake: true },
      { href: "/vendors", labelKey: "vendors", icon: Boxes, lockedUntilIntake: true },
      { href: "/questionnaires", labelKey: "questionnaires", icon: FileQuestion, lockedUntilIntake: true },
    ],
    sectionKey: "operations",
  },
  {
    items: [
      { href: "/incidents", labelKey: "incidents", icon: AlertTriangle, lockedUntilIntake: true },
      { href: "/risks", labelKey: "risks", icon: BarChart3, lockedUntilIntake: true },
      { href: "/agency/dashboard", labelKey: "clients", icon: BriefcaseBusiness, lockedUntilIntake: true },
      { href: "/team", labelKey: "team", icon: Users },
      { href: "/settings/organisation", labelKey: "settings", icon: Settings },
    ],
    sectionKey: "team",
  },
];

const mobileNavigation = [
  navigation[0].items[0],
  navigation[0].items[1],
  navigation[0].items[2],
  navigation[2].items[0],
];

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function formatBadgeCount(count: number) {
  return count > 99 ? "99+" : String(count);
}

function DashboardBadge({
  body,
  count,
  title,
}: {
  body: string;
  count: number;
  title: string;
}) {
  if (count <= 0) {
    return null;
  }

  return (
    <span className="relative ml-auto">
      <span
        aria-hidden="true"
        className="rounded-sm bg-danger px-2 py-0.5 text-[10px] font-medium text-white"
      >
        {formatBadgeCount(count)}
      </span>
      <span
        id="dashboard-regulation-count-help"
        role="tooltip"
        className="pointer-events-none absolute left-full top-1/2 z-20 ml-3 w-64 -translate-y-1/2 rounded-lg border border-white/10 bg-slate-950/95 p-3 text-left text-xs font-normal leading-relaxed text-slate-100 opacity-0 shadow-xl shadow-black/20 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
      >
        <span className="block text-[11px] font-semibold uppercase tracking-wide text-slate-300">
          {title}
        </span>
        <span className="mt-1 block text-slate-300">{body}</span>
      </span>
    </span>
  );
}

function getFocusableElements(container: HTMLElement | null) {
  if (!container) {
    return [];
  }

  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((element) => !element.hasAttribute("disabled") && element.getAttribute("aria-disabled") !== "true");
}

export function Sidebar({
  clerkEnabled,
  organisationName,
  isPreIntake = false,
  plan,
  regulationUpdateCount = 0,
}: {
  clerkEnabled: boolean;
  organisationName: string;
  isPreIntake?: boolean;
  plan: PlanKey;
  regulationUpdateCount?: number;
}) {
  const pathname = usePathname();
  const t = useTranslations("navigation");
  const dashboardBadgeHelpId = "dashboard-regulation-count-help";

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-[var(--app-sidebar-width)] border-r border-white/10 bg-[var(--color-brand-900)] text-white lg:flex lg:flex-col">
      <div className="flex h-20 items-center gap-3 border-b border-white/10 px-5 text-lg font-bold">
        <LogoMark className="h-9 w-9" />
        <span>Splnit.eu</span>
      </div>
      <nav className="grid flex-1 content-start gap-5 p-4 text-sm">
        {navigation.map((group) => (
          <div key={group.sectionKey}>
            <p className="px-3 pb-2 pt-2 text-[11px] font-semibold text-slate-500">
              {t(`sections.${group.sectionKey}`)}
            </p>
            <div className="grid gap-1">
              {group.items.map((item) => {
                const active = isActivePath(pathname, item.href);
                const locked = isPreIntake && Boolean(item.lockedUntilIntake);
                const hasDashboardBadge = item.href === "/dashboard" && regulationUpdateCount > 0;
                const dashboardBadgeCount = formatBadgeCount(regulationUpdateCount);

                return (
                  <Link
                    key={item.href}
                    href={locked ? "#" : item.href}
                    aria-describedby={hasDashboardBadge ? dashboardBadgeHelpId : undefined}
                    aria-disabled={locked}
                    aria-label={
                      hasDashboardBadge
                        ? t("dashboardBadge.linkLabel", { count: dashboardBadgeCount })
                        : undefined
                    }
                    title={locked ? t("lockedUntilIntake") : undefined}
                    tabIndex={locked ? -1 : undefined}
                    className={`group relative flex min-h-10 items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition-colors ${
                      locked
                        ? "pointer-events-none cursor-not-allowed text-slate-500 opacity-50"
                        : active
                        ? "bg-blue-600 font-semibold text-white shadow-sm shadow-blue-950/30"
                        : "text-slate-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <item.icon className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
                    {t(item.labelKey)}
                    {item.href === "/dashboard" ? (
                      <DashboardBadge
                        body={t("dashboardBadge.body")}
                        count={regulationUpdateCount}
                        title={t("dashboardBadge.title", { count: dashboardBadgeCount })}
                      />
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="border-t border-white/10 p-4">
        <div className="flex min-w-0 items-center gap-3 rounded-lg px-2 py-2 text-left">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-blue-600 text-sm font-bold text-white">
            {organisationName.slice(0, 1).toUpperCase()}
          </span>
          <Link href="/settings/organisation" className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-white">
              {organisationName}
            </span>
            <span className="block truncate text-xs capitalize text-slate-400">
              {plan}
            </span>
          </Link>
          {clerkEnabled ? (
            <SignOutButton>
              <button
                type="button"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" strokeWidth={1.6} />
              </button>
            </SignOutButton>
          ) : (
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-600">
              <LogOut className="h-4 w-4" aria-hidden="true" strokeWidth={1.6} />
            </span>
          )}
        </div>
      </div>
    </aside>
  );
}

export function MobileTabBar({
  isPreIntake = false,
  regulationUpdateCount = 0,
}: {
  isPreIntake?: boolean;
  regulationUpdateCount?: number;
}) {
  const pathname = usePathname();
  const t = useTranslations("navigation");
  const [moreOpen, setMoreOpen] = useState(false);
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const wasMoreOpenRef = useRef(false);

  useEffect(() => {
    if (!moreOpen) {
      if (wasMoreOpenRef.current) {
        moreButtonRef.current?.focus();
      }
      wasMoreOpenRef.current = false;
      return;
    }

    wasMoreOpenRef.current = true;
    const focusableElements = getFocusableElements(drawerRef.current);
    focusableElements[0]?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setMoreOpen(false);
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const elements = getFocusableElements(drawerRef.current);
      const first = elements[0];
      const last = elements[elements.length - 1];

      if (!first || !last) {
        event.preventDefault();
        return;
      }

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
        return;
      }

      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [moreOpen]);

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-border bg-surface/95 px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-1 backdrop-blur-xl lg:hidden">
        {mobileNavigation.map((item) => {
          const active = isActivePath(pathname, item.href);
          const locked = isPreIntake && Boolean(item.lockedUntilIntake);
          const hasDashboardBadge = item.href === "/dashboard" && regulationUpdateCount > 0;
          const dashboardBadgeCount = formatBadgeCount(regulationUpdateCount);

          return (
            <Link
              key={item.href}
              href={locked ? "#" : item.href}
              aria-disabled={locked}
              aria-label={
                hasDashboardBadge
                  ? t("dashboardBadge.linkLabel", { count: dashboardBadgeCount })
                  : undefined
              }
              tabIndex={locked ? -1 : undefined}
              className={`flex min-h-12 min-w-0 flex-col items-center justify-center gap-1 rounded-md px-1 text-[11px] ${
                locked
                  ? "pointer-events-none cursor-not-allowed text-foreground/35 opacity-45"
                  : active
                  ? "bg-[var(--accent-subtle)] font-medium text-primary"
                  : "text-foreground/62"
              }`}
            >
              <span className="relative">
                <item.icon className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
                {hasDashboardBadge ? (
                  <span aria-hidden="true" className="absolute -right-2 -top-2 h-2 w-2 rounded-full bg-danger" />
                ) : null}
              </span>
              <span className="max-w-full truncate">{t(item.labelKey)}</span>
            </Link>
          );
        })}

        <button
          ref={moreButtonRef}
          type="button"
          aria-controls="mobile-more-drawer"
          aria-expanded={moreOpen}
          onClick={() => setMoreOpen(true)}
          className="flex min-h-12 min-w-0 flex-col items-center justify-center gap-1 rounded-md px-1 text-[11px] text-foreground/62"
        >
          <MoreHorizontal className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
          <span className="max-w-full truncate">{t("more")}</span>
        </button>
      </nav>

      {moreOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          data-mobile-more-backdrop
          onClick={() => setMoreOpen(false)}
        >
          <div
            ref={drawerRef}
            id="mobile-more-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-more-title"
            className="absolute inset-x-0 bottom-0 max-h-[82vh] overflow-y-auto rounded-t-2xl bg-surface pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />
            <h2 id="mobile-more-title" className="sr-only">
              {t("more")}
            </h2>
            {navigation.map((group) => (
              <div key={group.sectionKey} className="mb-2">
                <p className="px-5 pb-1 pt-2 text-[11px] font-semibold uppercase text-foreground/40">
                  {t(`sections.${group.sectionKey}`)}
                </p>
                {group.items.map((item) => {
                  const active = isActivePath(pathname, item.href);
                  const locked = isPreIntake && Boolean(item.lockedUntilIntake);

                  return (
                    <Link
                      key={item.href}
                      href={locked ? "#" : item.href}
                      aria-disabled={locked}
                      tabIndex={locked ? -1 : undefined}
                      onClick={() => setMoreOpen(false)}
                      className={`flex h-12 items-center gap-3 px-5 text-sm ${
                        locked
                          ? "pointer-events-none text-foreground/35 opacity-45"
                          : active
                          ? "font-medium text-primary"
                          : "text-foreground"
                      }`}
                    >
                      <item.icon
                        className="h-4 w-4 shrink-0"
                        aria-hidden="true"
                        strokeWidth={1.5}
                      />
                      <span className="min-w-0 truncate">{t(item.labelKey)}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}
