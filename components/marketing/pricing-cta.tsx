"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const PRICING_CTA_FLAG = "pricing_cta_copy";
const POSTHOG_DEFAULTS = "2026-01-30";
type PostHogClient = typeof import("posthog-js").default;

const ctaVariants: Record<string, string> = {
  audit: "Získat auditní přehled",
  savings: "Spočítat úsporu",
  trial: "Zahájit 14denní zkušební verzi",
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
  posthogClient = posthog;
  window.__splnitPostHogStarted = true;

  return posthog;
}

function getFlaggedCopy(posthog: PostHogClient, fallback: string) {
  const variant = posthog.getFeatureFlag(PRICING_CTA_FLAG);

  if (typeof variant !== "string") {
    return fallback;
  }

  return ctaVariants[variant] ?? fallback;
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
  const [copy, setCopy] = useState(label);

  useEffect(() => {
    if (planName !== "Starter") {
      return;
    }

    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    void getPostHog().then((posthog) => {
      if (!posthog || cancelled) {
        return;
      }

      const applyVariant = () => {
        setCopy(getFlaggedCopy(posthog, label));
      };

      applyVariant();
      const stopListening = posthog.onFeatureFlags(applyVariant);

      if (typeof stopListening === "function") {
        unsubscribe = stopListening;
      }
    });

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [label, planName]);

  return (
    <Link
      href={href}
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
