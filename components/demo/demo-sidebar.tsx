"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpenCheck,
  Building2,
  Cloud,
  FileArchive,
  Home,
  LayoutDashboard,
} from "lucide-react";

import { LogoMark } from "@/components/brand/logo-mark";
import { DEMO_ORG } from "@/lib/demo/data";

const demoNavigation = [
  { href: "/demo", label: "Dashboard", icon: LayoutDashboard },
  { href: "/demo/controls", label: "Kontroly", icon: BookOpenCheck },
  { href: "/demo/workspaces/pohoda", label: "Pohoda", icon: Building2 },
  { href: "/demo/workspaces/hetzner", label: "Hetzner", icon: Cloud },
  { href: "/demo/export", label: "Export", icon: FileArchive },
];

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DemoSidebar() {
  const pathname = usePathname();

  return (
    <>
      <aside className="hidden border-r border-slate-800 bg-slate-900 text-white lg:fixed lg:bottom-0 lg:left-0 lg:top-[148px] lg:block lg:w-[220px]">
        <Link
          href="/"
          className="flex h-16 items-center gap-3 border-b border-white/10 px-5 text-sm font-bold transition-colors hover:text-white"
          aria-label="Zpět na homepage Splnit.eu"
        >
          <LogoMark className="h-8 w-8" />
          Splnit.eu
        </Link>
        <div className="border-b border-white/10 px-5 py-4">
          <p className="truncate text-sm font-semibold">{DEMO_ORG.name}</p>
          <p className="mt-1 text-xs text-slate-400">
            {DEMO_ORG.sector} · {DEMO_ORG.employees} zaměstnanců
          </p>
        </div>
        <nav className="grid gap-5 p-4 text-sm" aria-label="Demo navigace">
          <div>
            <p className="px-3 pb-2 pt-2 text-[11px] font-semibold text-slate-500">
              Demo profil
            </p>
            <div className="grid gap-1">
              {demoNavigation.map((item) => {
                const active = isActivePath(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex min-h-10 items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition-colors ${
                      active
                        ? "bg-blue-600 font-semibold text-white"
                        : "text-slate-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <item.icon className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>
      </aside>
      <nav className="sticky top-[145px] z-30 border-b border-border bg-surface/95 px-4 py-2 backdrop-blur lg:hidden">
        <div className="flex gap-2 overflow-x-auto" aria-label="Demo navigace">
          <Link
            href="/"
            aria-label="Zpět na homepage Splnit.eu"
            className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground/68"
          >
            <Home className="h-3.5 w-3.5" aria-hidden="true" strokeWidth={1.6} />
            Domů
          </Link>
          {demoNavigation.map((item) => {
            const active = isActivePath(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold ${
                  active
                    ? "bg-blue-600 text-white"
                    : "border border-border bg-background text-foreground/68"
                }`}
              >
                <item.icon className="h-3.5 w-3.5" aria-hidden="true" strokeWidth={1.6} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
