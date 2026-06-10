import Link from "next/link";

import { LogoMark } from "@/components/brand/logo-mark";

export function AuthLogoLink() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <LogoMark className="h-8 w-8" />
      <span className="text-xl font-bold tracking-normal text-foreground">
        Splnit<span className="text-[var(--color-logo-green)]">.eu</span>
      </span>
    </Link>
  );
}
