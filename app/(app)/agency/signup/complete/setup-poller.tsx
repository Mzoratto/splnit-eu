"use client";

import { useEffect, useState } from "react";

export function SetupPoller({
  readyPath,
  timeoutText,
}: {
  readyPath: string;
  timeoutText: string;
}) {
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    let attempts = 0;
    const interval = window.setInterval(async () => {
      attempts += 1;

      try {
        const response = await fetch("/api/agency/setup-status", {
          cache: "no-store",
        });
        const data = await response.json() as { ready?: boolean };

        if (data.ready) {
          window.clearInterval(interval);
          window.location.assign(readyPath);
        }
      } catch {
        // Polling retries until the timeout below.
      }

      if (attempts >= 15) {
        window.clearInterval(interval);
        setTimedOut(true);
      }
    }, 2000);

    return () => window.clearInterval(interval);
  }, [readyPath]);

  return timedOut ? (
    <p className="rounded-md border border-border bg-surface p-3 text-sm text-foreground/70">
      {timeoutText}
    </p>
  ) : null;
}
