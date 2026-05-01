"use client";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  getCookieConsent,
  setCookieConsent,
  type CookieConsentValue,
} from "@/lib/privacy/cookie-consent";

const appRoutePrefixes = [
  "/clients",
  "/controls",
  "/dashboard",
  "/evidence",
  "/frameworks",
  "/incidents",
  "/integrations",
  "/onboarding",
  "/policies",
  "/questionnaires",
  "/risks",
  "/settings",
  "/team",
  "/trust-center",
  "/vendors",
];

export function CookieConsent() {
  const pathname = usePathname();
  const [consent, setConsent] = useState<CookieConsentValue | null>(null);
  const [visible, setVisible] = useState(false);
  const isAppRoute = appRoutePrefixes.some((prefix) => pathname.startsWith(prefix));

  useEffect(() => {
    const currentConsent = getCookieConsent();
    setConsent(currentConsent);
    setVisible(!currentConsent && !isAppRoute);
  }, [isAppRoute]);

  useEffect(() => {
    function openCookieSettings() {
      setVisible(true);
    }

    window.addEventListener("splnit:open-cookie-settings", openCookieSettings);
    return () =>
      window.removeEventListener("splnit:open-cookie-settings", openCookieSettings);
  }, []);

  function chooseConsent(value: CookieConsentValue) {
    setCookieConsent(value);
    setConsent(value);
    setVisible(false);
  }

  return (
    <>
      {consent === "accepted" ? (
        <>
          <Analytics />
          <SpeedInsights />
        </>
      ) : null}
      {visible ? (
        <div className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-3xl rounded-lg border border-border bg-surface p-4 shadow-[var(--shadow-md)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium">Cookies</p>
              <p className="mt-1 text-sm leading-6 text-foreground/64">
                Používáme nezbytné cookies a volitelné měření návštěvnosti pro zlepšování Splnit.eu.
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => chooseConsent("rejected")}
                className="btn btn-secondary"
              >
                Odmítnout
              </button>
              <button
                type="button"
                onClick={() => chooseConsent("accepted")}
                className="btn btn-primary"
              >
                Přijmout
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
