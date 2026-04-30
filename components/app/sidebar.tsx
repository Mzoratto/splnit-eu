"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlertTriangle,
  BarChart3,
  BookOpenCheck,
  Boxes,
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
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/frameworks", label: "Frameworky", icon: Landmark },
  { href: "/controls", label: "Kontroly", icon: BookOpenCheck },
  { href: "/evidence", label: "Evidence", icon: FileArchive },
  { href: "/integrations", label: "Integrace", icon: Plug },
  { href: "/policies", label: "Politiky", icon: ScrollText },
  { href: "/vendors", label: "Dodavatelé", icon: Boxes },
  { href: "/incidents", label: "Incidenty", icon: AlertTriangle },
  { href: "/risks", label: "Rizika", icon: BarChart3 },
  { href: "/team", label: "Tým", icon: Users },
  { href: "/settings/organisation", label: "Nastavení", icon: Settings },
];

const mobileNavigation = [
  navigation[0],
  navigation[1],
  navigation[2],
  navigation[4],
  navigation[10],
];

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function Badge({ count }: { count: number }) {
  if (count <= 0) {
    return null;
  }

  return (
    <span className="ml-auto rounded-full bg-danger px-2 py-0.5 text-[10px] font-semibold text-white">
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

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-border bg-surface lg:block">
      <div className="flex h-16 items-center gap-2 border-b border-border px-5 font-semibold">
        <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
        Splnit.eu
      </div>
      <nav className="grid gap-1 p-3 text-sm">
        {navigation.map((item) => {
          const active = isActivePath(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2 ${
                active
                  ? "bg-surface-muted font-medium text-foreground"
                  : "text-foreground/74 hover:bg-surface-muted hover:text-foreground"
              }`}
            >
              <item.icon className="h-4 w-4" aria-hidden="true" />
              {item.label}
              {item.href === "/dashboard" ? (
                <Badge count={regulationUpdateCount} />
              ) : null}
            </Link>
          );
        })}
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

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-border bg-surface/95 px-2 pb-2 pt-1 backdrop-blur lg:hidden">
      {mobileNavigation.map((item) => {
        const active = isActivePath(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-md text-[11px] ${
              active
                ? "bg-surface-muted font-medium text-primary"
                : "text-foreground/62"
            }`}
          >
            <span className="relative">
              <item.icon className="h-4 w-4" aria-hidden="true" />
              {item.href === "/dashboard" && regulationUpdateCount > 0 ? (
                <span className="absolute -right-2 -top-2 h-2 w-2 rounded-full bg-danger" />
              ) : null}
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
