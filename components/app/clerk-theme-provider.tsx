"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import {
  clerkDarkAppearance,
  clerkLightAppearance,
} from "@/lib/clerk/appearance";

export function ClerkThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const root = document.documentElement;
    const readTheme = () => {
      setTheme(root.dataset.theme === "dark" ? "dark" : "light");
    };

    readTheme();
    const observer = new MutationObserver(readTheme);
    observer.observe(root, { attributeFilter: ["data-theme"] });

    return () => observer.disconnect();
  }, []);

  return (
    <ClerkProvider
      appearance={theme === "dark" ? clerkDarkAppearance : clerkLightAppearance}
    >
      {children}
    </ClerkProvider>
  );
}
