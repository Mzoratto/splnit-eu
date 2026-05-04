"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  AlertTriangle,
  BarChart3,
  BriefcaseBusiness,
  BookOpenCheck,
  Boxes,
  FileQuestion,
  FileArchive,
  Landmark,
  LayoutDashboard,
  Plug,
  ScrollText,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";

const navigation = [
  {
    items: [
      { href: "/dashboard", labelKey: "dashboard", icon: LayoutDashboard },
      { href: "/frameworks", labelKey: "frameworks", icon: Landmark },
      { href: "/controls", labelKey: "controls", icon: BookOpenCheck },
      { href: "/evidence", labelKey: "evidence", icon: FileArchive },
    ],
    sectionKey: "overview",
  },
  {
    items: [
      { href: "/integrations", labelKey: "integrations", icon: Plug },
      { href: "/policies", labelKey: "policies", icon: ScrollText },
      { href: "/vendors", labelKey: "vendors", icon: Boxes },
      { href: "/questionnaires", labelKey: "questionnaires", icon: FileQuestion },
    ],
    sectionKey: "operations",
  },
  {
    items: [
      { href: "/incidents", labelKey: "incidents", icon: AlertTriangle },
      { href: "/risks", labelKey: "risks", icon: BarChart3 },
      { href: "/clients", labelKey: "clients", icon: BriefcaseBusiness },
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
  navigation[1].items[0],
  navigation[2].items[4],
];

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function Badge({ count }: { count: number }) {
  if (count <= 0) {
    return null;
  }

  return (
    <span className="ml-auto rounded-sm bg-danger px-2 py-0.5 text-[10px] font-medium text-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}

export function Sidebar({
  regulationUpdateCount = 0,
}: {
  regulationUpdateCount?: number;
}) {
  const pathname = usePathname();
  const t = useTranslations("navigation");

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-[220px] border-r border-border bg-background lg:block">
      <div className="flex h-14 items-center gap-2 border-b border-border px-4 text-sm font-medium">
        <ShieldCheck
          className="h-5 w-5 text-primary"
          aria-hidden="true"
          strokeWidth={1.5}
        />
        Splnit.eu
      </div>
      <nav className="grid gap-3 p-3 text-sm">
        {navigation.map((group) => (
          <div key={group.sectionKey}>
            <p className="px-3 pb-2 pt-2 text-[11px] font-medium text-foreground/48">
              {t(`sections.${group.sectionKey}`)}
            </p>
            <div className="grid gap-1">
              {group.items.map((item) => {
                const active = isActivePath(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] ${
                      active
                        ? "bg-[var(--accent-subtle)] font-medium text-primary"
                        : "text-foreground/70 hover:bg-bg-hover hover:text-foreground"
                    }`}
                    >
                    <item.icon className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
                    {t(item.labelKey)}
                    {item.href === "/dashboard" ? (
                      <Badge count={regulationUpdateCount} />
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}

export function MobileTabBar({
  regulationUpdateCount = 0,
}: {
  regulationUpdateCount?: number;
}) {
  const pathname = usePathname();
  const t = useTranslations("navigation");

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-border bg-surface/95 px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-1 backdrop-blur-xl lg:hidden">
      {mobileNavigation.map((item) => {
        const active = isActivePath(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex min-h-12 min-w-0 flex-col items-center justify-center gap-1 rounded-md px-1 text-[11px] ${
              active
                ? "bg-[var(--accent-subtle)] font-medium text-primary"
                : "text-foreground/62"
            }`}
          >
            <span className="relative">
              <item.icon className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
              {item.href === "/dashboard" && regulationUpdateCount > 0 ? (
                <span className="absolute -right-2 -top-2 h-2 w-2 rounded-full bg-danger" />
              ) : null}
            </span>
            <span className="max-w-full truncate">{t(item.labelKey)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
