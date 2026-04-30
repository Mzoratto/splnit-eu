import Link from "next/link";
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

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-border bg-surface lg:block">
        <div className="flex h-16 items-center gap-2 border-b border-border px-5 font-semibold">
          <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
          Splnit.eu
        </div>
        <nav className="grid gap-1 p-3 text-sm">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-foreground/74 hover:bg-surface-muted hover:text-foreground"
            >
              <item.icon className="h-4 w-4" aria-hidden="true" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-surface/92 px-5 backdrop-blur">
          <div>
            <p className="text-sm font-medium">Demo organizace</p>
            <p className="text-xs text-foreground/58">Plan: Starter</p>
          </div>
          <Link
            href="/trust/demo"
            className="rounded-md border border-border px-3 py-2 text-sm hover:bg-surface-muted"
          >
            Trust Center
          </Link>
        </header>
        <main className="mx-auto w-full max-w-7xl px-5 py-8">{children}</main>
      </div>
    </div>
  );
}
