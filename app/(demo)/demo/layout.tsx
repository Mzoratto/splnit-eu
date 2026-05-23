import type { Metadata } from "next";

import { DemoBanner } from "@/components/demo/demo-banner";
import { DemoSidebar } from "@/components/demo/demo-sidebar";
import { Nav } from "@/components/nav";

export const metadata: Metadata = {
  title: "Demo | Splnit.eu",
  description:
    "Veřejné demo platformy Splnit.eu na fiktivním profilu české výrobní firmy.",
};

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Nav />
      <div className="min-h-screen bg-background pt-16 text-foreground">
        <DemoBanner />
        <DemoSidebar />
        <div className="lg:pl-[220px]">
          <main className="w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:pb-20">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
