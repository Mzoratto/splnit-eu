"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@/components/marketing/local-icon";

export function StickyCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      const hero = document.querySelector("[data-hero]");
      const threshold = hero instanceof HTMLElement ? hero.offsetHeight : 600;
      setVisible(window.scrollY > threshold);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`fixed bottom-6 right-6 z-40 transition-[opacity,transform] duration-200 ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-8 opacity-0"
      }`}
    >
      <div className="rounded-full bg-gradient-to-b from-blue-400 to-blue-700 p-px shadow-xl shadow-blue-200/50">
        <Link
          href="/sign-up"
          className="flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500"
        >
          <Icon
            icon="solar:shield-keyhole-linear"
            className="text-sm"
            aria-hidden="true"
          />
          Začít zdarma
        </Link>
      </div>
    </div>
  );
}
