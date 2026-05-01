"use client";

import { useEffect } from "react";

export function MarketingAnimations() {
  useEffect(() => {
    let cancelled = false;
    let killScrollTriggers = () => {};
    const scrollTriggers: { kill: () => void }[] = [];
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    async function runMotion() {
      document.documentElement.classList.add("motion-ready");

      if (reduced) {
        return;
      }

      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);

      if (cancelled) {
        return;
      }

      gsap.registerPlugin(ScrollTrigger);
      killScrollTriggers = () => {
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      };

      const revWords = gsap.utils.toArray<HTMLElement>(".rev-word");
      if (revWords.length) {
        gsap.to(revWords, {
          y: "0%",
          duration: 1,
          ease: "power3.out",
          stagger: 0.06,
          delay: 0.15,
        });
      }

      const fadeUpElements = gsap.utils.toArray<HTMLElement>(".fade-up");
      if (fadeUpElements.length) {
        gsap.set(fadeUpElements, { y: 16, opacity: 0 });
        gsap.to(fadeUpElements, {
          y: 0,
          opacity: 1,
          duration: 0.75,
          ease: "power2.out",
          stagger: 0.08,
          delay: 0.7,
        });
      }

      gsap.utils.toArray<HTMLElement>(".scroll-animate").forEach((element) => {
        const x = element.classList.contains("-translate-x-6")
          ? -24
          : element.classList.contains("translate-x-6")
            ? 24
            : 0;
        const y = element.classList.contains("translate-y-6") ? 24 : 0;

        gsap.set(element, { x, y, opacity: 0 });
        gsap.to(element, {
          scrollTrigger: {
            trigger: element,
            start: "top 88%",
            toggleActions: "play none none none",
          },
          y: 0,
          x: 0,
          opacity: 1,
          duration: 0.75,
          ease: "power2.out",
        });
      });

      const dashboard = document.querySelector("#dashboard-wrap");
      if (dashboard) {
        scrollTriggers.push(
          ScrollTrigger.create({
            trigger: dashboard,
            start: "top 80%",
            once: true,
            onEnter: () => {
              const ring = document.querySelector<SVGCircleElement>("#score-ring");
              const score = document.querySelector<HTMLElement>("#score-val");
              const bars = [
                ["#bar-nis2", "91%"],
                ["#bar-gdpr", "88%"],
                ["#bar-aiact", "67%"],
              ] as const;

              if (ring) {
                ring.style.strokeDashoffset = "16.59";
              }

              if (score) {
                let value = 0;
                const interval = window.setInterval(() => {
                  value += 2;
                  score.textContent = `${value}%`;
                  if (value >= 88) {
                    score.textContent = "88%";
                    window.clearInterval(interval);
                  }
                }, 18);
              }

              window.setTimeout(() => {
                bars.forEach(([selector, width]) => {
                  const bar = document.querySelector<HTMLElement>(selector);
                  if (bar) {
                    bar.style.width = width;
                  }
                });
              }, 200);
            },
          }),
        );
      }
    }

    const motionTimeout = window.setTimeout(() => {
      void runMotion();
    }, 120);

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
      cancelled = true;
      window.clearTimeout(motionTimeout);
      window.clearInterval(sidebarInterval);
      window.clearInterval(toggleInterval);
      scrollTriggers.forEach((trigger) => trigger.kill());
      killScrollTriggers();
      document.documentElement.classList.remove("motion-ready");
    };
  }, []);

  return null;
}
