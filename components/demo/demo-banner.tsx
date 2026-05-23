import Link from "next/link";
import { ArrowRight, Home, LogIn, Search } from "lucide-react";

import { DEMO_ORG } from "@/lib/demo/data";

export function DemoBanner() {
  return (
    <div className="sticky top-20 z-40 border-b border-amber-200 bg-amber-50/95 px-4 py-3 text-amber-950 shadow-sm backdrop-blur sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 gap-3">
          <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-amber-200 bg-amber-100 text-amber-800">
            <Search className="h-4 w-4" aria-hidden="true" strokeWidth={1.8} />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold">
              Demo — prohlížíte vzorový profil firmy {DEMO_ORG.name}
            </p>
            <p className="mt-0.5 text-xs leading-5 text-amber-900/78">
              Data jsou fiktivní. Výsledky pro vaši firmu získáte po
              registraci.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-amber-200 bg-white/80 px-3 py-2 text-sm font-semibold text-amber-950 transition-colors hover:bg-white"
          >
            <Home className="h-4 w-4" aria-hidden="true" strokeWidth={1.7} />
            Domů
          </Link>
          <Link
            href="/sign-up?ref=demo"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-hover)]"
            data-demo-cta="banner-primary"
          >
            Začít zdarma
            <ArrowRight className="h-4 w-4" aria-hidden="true" strokeWidth={1.7} />
          </Link>
          <Link
            href="/sign-in"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-amber-200 bg-white/80 px-3 py-2 text-sm font-semibold text-amber-950 transition-colors hover:bg-white"
          >
            <LogIn className="h-4 w-4" aria-hidden="true" strokeWidth={1.7} />
            Přihlásit se
          </Link>
        </div>
      </div>
    </div>
  );
}
