"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "@iconify/react";

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
    <AnimatePresence>
      {visible ? (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 right-6 z-40"
          exit={{ opacity: 0, y: 64 }}
          initial={{ opacity: 0, y: 64 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
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
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
