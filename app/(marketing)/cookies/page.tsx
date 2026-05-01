import type { Metadata } from "next";
import { CookieSettingsButton } from "@/components/legal/cookie-settings-button";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Cookies | Splnit.eu",
  description: "Přehled používání cookies a měření návštěvnosti na Splnit.eu.",
};

export default function CookiesPage() {
  return (
    <LegalPage
      title="Cookies"
      intro="Cookies používáme střídmě: pro fungování webu, přihlášení, uložení jazykové volby, uložení volby cookie banneru a volitelné měření výkonu a návštěvnosti."
      sections={[
        {
          title: "Nezbytné cookies",
          body: [
            "Nezbytné cookies drží relaci, jazyk, bezpečnostní nastavení a volbu cookie banneru. Bez nich služba nemusí fungovat správně a pro jejich uložení není podle zákona o elektronických komunikacích vyžadován souhlas.",
            "Příklady: NEXT_LOCALE pro jazyk, cc-cookie-consent pro uložení volby banneru a autentizační cookies poskytovatele přihlášení, pokud používáte aplikaci.",
          ],
        },
        {
          title: "Volitelné měření návštěvnosti a výkonu",
          body: [
            "Vercel Web Analytics a Speed Insights používáme pro agregované měření návštěvnosti, rychlosti načítání a Core Web Vitals pouze po souhlasu v cookie banneru.",
            "Tyto údaje nepoužíváme k prodeji reklamního profilu ani k předávání reklamním sítím.",
            "Pokud v konkrétním prostředí zapneme další analytické nebo produktové nástroje, například PostHog, musí zůstat vázané na odpovídající souhlas nebo jiný platný právní základ a musí být doplněny do tohoto přehledu.",
          ],
        },
        {
          title: "Správa souhlasu",
          body: [
            "Souhlas nebo odmítnutí ukládáme do cookie cc-cookie-consent po dobu 180 dnů.",
            "Souhlas není podmínkou přístupu k webu ani aplikaci. Odmítnutí volitelného měření nemá vliv na základní funkčnost služby.",
            "Volbu můžete změnit tlačítkem níže nebo smazáním cookies ve svém prohlížeči.",
          ],
        },
      ]}
    >
      <CookieSettingsButton />
    </LegalPage>
  );
}
