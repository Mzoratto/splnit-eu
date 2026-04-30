import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "DPA a subdodavatelé | Splnit.eu",
  description: "Přehled zpracovatelské smlouvy a subdodavatelů Splnit.eu.",
};

export default function DpaPage() {
  return (
    <LegalPage
      title="DPA a subdodavatelé"
      intro="Tento přehled slouží jako veřejný základ pro zpracovatelskou smlouvu a řízení subdodavatelů služby Splnit.eu."
      sections={[
        {
          title: "Role",
          body: [
            "U zákaznických dat vystupuje Splnit Technology s.r.o. zpravidla jako zpracovatel a zákazník jako správce. U obchodní komunikace a provozních metrik vystupujeme jako správce.",
          ],
        },
        {
          title: "Subdodavatelé",
          body: [
            "Používáme zejména Vercel pro hosting, Neon pro databázi, Clerk pro autentizaci, Stripe pro billing, Resend a Loops pro e-mail, Upstash pro Redis, Sentry pro observabilitu a Vercel Blob pro soubory.",
          ],
        },
        {
          title: "Bezpečnostní opatření",
          body: [
            "Data oddělujeme podle organizací, používáme šifrované přenosy, auditní logy, princip nejmenších oprávnění a omezený přístup k produkčním systémům.",
          ],
        },
        {
          title: "Změny subdodavatelů",
          body: [
            "Podstatné změny subdodavatelů oznamujeme zákazníkům přiměřeným způsobem. Aktuální kontaktní adresa pro námitky je hello@splnit.eu.",
          ],
        },
      ]}
    />
  );
}
