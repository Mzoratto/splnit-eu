"use client";

import dynamic from "next/dynamic";

const DeferredMarketingAnimations = dynamic(
  () =>
    import("@/components/marketing/animations").then(
      (mod) => mod.MarketingAnimations,
    ),
  { ssr: false },
);

const DeferredStickyCta = dynamic(
  () => import("@/components/sticky-cta").then((mod) => mod.StickyCta),
  { ssr: false },
);

export function DeferredMarketingEffects() {
  return (
    <>
      <DeferredMarketingAnimations />
      <DeferredStickyCta />
    </>
  );
}
