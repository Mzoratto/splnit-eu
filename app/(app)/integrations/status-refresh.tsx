"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function IntegrationStatusRefresh({ enabled }: { enabled: boolean }) {
  const router = useRouter();

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const interval = window.setInterval(() => {
      router.refresh();
    }, 60_000);

    return () => window.clearInterval(interval);
  }, [enabled, router]);

  return null;
}
