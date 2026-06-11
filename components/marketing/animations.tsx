"use client";

import { useEffect } from "react";

export function MarketingAnimations() {
  useEffect(() => {
    document.documentElement.classList.add("motion-ready");

    const sidebarItems = document.querySelectorAll<HTMLElement>(".sidebar-item");
    let currentSidebar = 0;
    const sidebarStateClasses = [
      "bg-[var(--color-green-700)]",
      "bg-[var(--color-green-050)]",
      "text-white",
      "text-slate-900",
      "text-slate-300",
      "text-zinc-500",
      "text-[var(--color-green-700)]",
    ];

    const renderSidebarState = () => {
      sidebarItems.forEach((item, index) => {
        item.classList.remove(...sidebarStateClasses);

        if (index === 0) {
          item.classList.add("bg-[var(--color-green-700)]", "text-white");
          return;
        }

        if (index === currentSidebar) {
          item.classList.add("bg-[var(--color-green-050)]", "text-slate-900");
          return;
        }

        item.classList.add("text-slate-300");
      });
    };

    renderSidebarState();

    const sidebarInterval = window.setInterval(() => {
      if (!sidebarItems.length) {
        return;
      }

      currentSidebar = (currentSidebar + 1) % sidebarItems.length;
      renderSidebarState();
    }, 3500);

    const knob = document.querySelector<HTMLElement>("#toggle-knob");
    const toggleInterval = window.setInterval(() => {
      if (!knob) {
        return;
      }

      knob.style.transform = "translateX(-2px)";
      window.setTimeout(() => {
        knob.style.transform = "";
      }, 400);
    }, 3000);

    return () => {
      window.clearInterval(sidebarInterval);
      window.clearInterval(toggleInterval);
      document.documentElement.classList.remove("motion-ready");
    };
  }, []);

  return null;
}
