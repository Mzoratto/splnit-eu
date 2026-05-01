"use client";

import { useEffect } from "react";

export function MarketingAnimations() {
  useEffect(() => {
    document.documentElement.classList.add("motion-ready");

    const sidebarItems = document.querySelectorAll<HTMLElement>(".sidebar-item");
    let currentSidebar = 0;
    const sidebarInterval = window.setInterval(() => {
      if (!sidebarItems.length) {
        return;
      }

      sidebarItems.forEach((item) => {
        item.classList.remove("bg-blue-50", "text-blue-700");
        item.classList.add("text-zinc-500");
      });
      currentSidebar = (currentSidebar + 1) % sidebarItems.length;
      sidebarItems[currentSidebar]?.classList.add("bg-blue-50", "text-blue-700");
      sidebarItems[currentSidebar]?.classList.remove("text-zinc-500");
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
