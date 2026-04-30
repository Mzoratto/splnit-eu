import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Cookies | Splnit.eu",
  description: "Přehled používání cookies a měření návštěvnosti na Splnit.eu.",
};

export default function CookiesPage() {
  return (
    <LegalPage
      title="Cookies"
      intro="Cookies používáme střídmě: pro fungování webu, přihlášení a základní měření výkonu a návštěvnosti."
      sections={[
        {
          title: "Nezbytné cookies",
          body: [
            "Nezbytné cookies drží relaci, jazyk, bezpečnostní nastavení a volbu cookie banneru. Bez nich služba nemusí fungovat správně.",
          ],
        },
        {
          title: "Analytika a výkon",
          body: [
            "Vercel Web Analytics a Speed Insights používáme pro agregované měření návštěvnosti, rychlosti načítání a Core Web Vitals.",
            "Tyto údaje nepoužíváme k prodeji reklamního profilu ani k předávání reklamním sítím.",
          ],
        },
        {
          title: "Správa souhlasu",
          body: [
            "Souhlas nebo odmítnutí ukládáme do cookie cc-cookie-consent po dobu 180 dnů.",
            "Volbu můžete změnit smazáním cookies ve svém prohlížeči.",
          ],
        },
      ]}
    />
  );
}
