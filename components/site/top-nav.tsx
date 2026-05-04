import Link from "next/link";
import { LogoMark } from "@/components/brand/logo-mark";

export function TopNav() {
  return (
    <header className="fixed inset-x-0 top-0 z-30 border-b border-white/20 bg-[#0e1813]/80 text-white backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <LogoMark className="h-5 w-5" />
          Splnit.eu
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-white/80 md:flex">
          <Link href="/pricing" className="hover:text-white">
            Ceník
          </Link>
          <Link href="/dashboard" className="hover:text-white">
            Aplikace
          </Link>
          <Link href="/sign-in" className="hover:text-white">
            Přihlášení
          </Link>
        </nav>
      </div>
    </header>
  );
}
