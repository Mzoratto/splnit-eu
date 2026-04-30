"use client";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { useEffect, useState } from "react";

const consentCookie = "cc-cookie-consent";
type ConsentValue = "accepted" | "rejected";

function setConsentCookie(value: ConsentValue) {
  const maxAge = 60 * 60 * 24 * 180;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${consentCookie}=${value}; Max-Age=${maxAge}; Path=/; SameSite=Lax${secure}`;
}

function getConsentCookie(): ConsentValue | null {
  const match = document.cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${consentCookie}=`));

  if (!match) {
    return null;
  }

  const value = match.split("=")[1];
  return value === "accepted" || value === "rejected" ? value : null;
}

export function CookieConsent() {
  const [consent, setConsent] = useState<ConsentValue | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const currentConsent = getConsentCookie();
    setConsent(currentConsent);
    setVisible(!currentConsent);
  }, []);

  function chooseConsent(value: ConsentValue) {
    setConsentCookie(value);
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
        <div className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-3xl rounded-lg border border-border bg-surface p-4 shadow-xl shadow-zinc-950/10">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold">Cookies</p>
              <p className="mt-1 text-sm leading-6 text-foreground/64">
                Používáme nezbytné cookies a měření návštěvnosti pro zlepšování Splnit.eu.
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => chooseConsent("rejected")}
                className="rounded-md border border-border px-4 py-2 text-sm font-medium"
              >
                Odmítnout
              </button>
              <button
                type="button"
                onClick={() => chooseConsent("accepted")}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
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
