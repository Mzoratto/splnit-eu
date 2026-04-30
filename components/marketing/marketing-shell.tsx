import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { DeferredMarketingEffects } from "@/components/marketing/deferred-effects";

export function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      {children}
      <Footer />
      <DeferredMarketingEffects />
    </>
  );
}
