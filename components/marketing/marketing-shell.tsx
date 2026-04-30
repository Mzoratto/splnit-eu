import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { StickyCta } from "@/components/sticky-cta";
import { MarketingAnimations } from "@/components/marketing/animations";

export function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <MarketingAnimations />
      {children}
      <Footer />
      <StickyCta />
    </>
  );
}
