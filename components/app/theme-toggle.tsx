"use client";

import { Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

function setRootTheme(theme: "light" | "dark") {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  window.localStorage.setItem("splnit-theme", theme);
}

export function ThemeToggle() {
  const t = useTranslations("shell");
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
  }, []);

  const nextTheme = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      className="btn btn-ghost h-9 w-9 px-0"
      aria-label={theme === "dark" ? t("switchToLight") : t("switchToDark")}
      onClick={() => {
        setRootTheme(nextTheme);
        setTheme(nextTheme);
      }}
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
      ) : (
        <Moon className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
      )}
    </button>
  );
}
