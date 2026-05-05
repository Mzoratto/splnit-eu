"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { useEffect, useState } from "react";
import { getLocalizedMarketingPath } from "@/i18n/marketing-paths";
import { normalizeLocale, type Locale } from "@/i18n/routing";
import {
  cookieConsentChangedEvent,
  hasOptionalAnalyticsConsent,
  type CookieConsentValue,
} from "@/lib/privacy/cookie-consent";

const PRICING_CTA_FLAG = "pricing_cta_copy";
const POSTHOG_DEFAULTS = "2026-01-30";
type PostHogClient = typeof import("posthog-js").default;

const ctaVariants: Record<Locale, Record<string, string>> = {
  "cs-CZ": {
    audit: "Získat auditní přehled",
    savings: "Spočítat úsporu",
    trial: "Zahájit 14denní zkušební verzi",
  },
  "en-EU": {
    audit: "Get an audit overview",
    savings: "Calculate savings",
    trial: "Start a 14-day trial",
  },
  "it-IT": {
    audit: "Ottieni panoramica audit",
    savings: "Calcola il risparmio",
    trial: "Avvia prova di 14 giorni",
  },
};

declare global {
  interface Window {
    __splnitPostHogStarted?: boolean;
  }
}

let posthogClient: PostHogClient | null = null;

async function getPostHog() {
  if (typeof window === "undefined") {
    return null;
  }

  if (!hasOptionalAnalyticsConsent()) {
    return null;
  }

  if (window.__splnitPostHogStarted) {
    const { default: posthog } = await import("posthog-js");
    posthogClient = posthog;
    return posthogClient;
  }

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) {
    return null;
  }

  const { default: posthog } = await import("posthog-js");
  posthog.init(key, {
    api_host:
      process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com",
    autocapture: false,
    capture_pageview: false,
    defaults: POSTHOG_DEFAULTS,
  });
  posthog.opt_in_capturing();
  posthogClient = posthog;
  window.__splnitPostHogStarted = true;

  return posthog;
}

function stopPostHog() {
  posthogClient?.opt_out_capturing();
  posthogClient = null;

  if (typeof window !== "undefined") {
    window.__splnitPostHogStarted = false;
  }
}

function getFlaggedCopy(posthog: PostHogClient, fallback: string, locale: Locale) {
  const variant = posthog.getFeatureFlag(PRICING_CTA_FLAG);

  if (typeof variant !== "string") {
    return fallback;
  }

  return ctaVariants[locale][variant] ?? fallback;
}

export function PricingCta({
  featured,
  href,
  label,
  planName,
}: {
  featured?: boolean;
  href: string;
  label: string;
  planName: string;
}) {
  const locale = normalizeLocale(useLocale()) ?? "cs-CZ";
  const [copy, setCopy] = useState(label);

  useEffect(() => {
    setCopy(label);

    if (planName !== "Starter") {
      return;
    }

    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    const applyPostHogCopy = async () => {
      const posthog = await getPostHog();

      if (!posthog || cancelled) {
        return;
      }

      const applyVariant = () => {
        setCopy(getFlaggedCopy(posthog, label, locale));
      };

      applyVariant();
      const stopListening = posthog.onFeatureFlags(applyVariant);

      if (typeof stopListening === "function") {
        unsubscribe = stopListening;
      }
    };

    void applyPostHogCopy();

    const onConsentChange = (event: Event) => {
      const consent = (event as CustomEvent<CookieConsentValue>).detail;

      if (consent === "accepted") {
        void applyPostHogCopy();
        return;
      }

      unsubscribe?.();
      unsubscribe = undefined;
      stopPostHog();
      setCopy(label);
    };

    window.addEventListener(cookieConsentChangedEvent, onConsentChange);

    return () => {
      cancelled = true;
      window.removeEventListener(cookieConsentChangedEvent, onConsentChange);
      unsubscribe?.();
    };
  }, [label, locale, planName]);

  return (
    <Link
      href={href.startsWith("/") ? getLocalizedMarketingPath(href, locale) : href}
      data-attr={planName === "Starter" ? PRICING_CTA_FLAG : undefined}
      className={
        featured
          ? "block rounded-full bg-blue-600 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-blue-500"
          : "block rounded-full border border-zinc-200 bg-white py-2.5 text-center text-sm font-medium text-zinc-800 shadow-sm transition-colors hover:bg-zinc-50"
      }
    >
      {copy}
    </Link>
  );
}
