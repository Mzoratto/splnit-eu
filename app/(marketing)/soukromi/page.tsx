import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Zásady ochrany soukromí | Splnit.eu",
  description:
    "Informace o zpracování osobních údajů ve službě Splnit.eu podle GDPR.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Zásady ochrany soukromí"
      intro="Tyto zásady popisují, jak Splnit Technology s.r.o. zpracovává osobní údaje návštěvníků webu, uživatelů aplikace a obchodních kontaktů."
      sections={[
        {
          title: "Správce údajů",
          body: [
            "Správcem je Splnit Technology s.r.o., Ostrava, Česká republika. Pro dotazy k ochraně osobních údajů nás kontaktujte na hello@splnit.eu.",
          ],
        },
        {
          title: "Jaké údaje zpracováváme",
          body: [
            "Zpracováváme identifikační a kontaktní údaje, údaje o organizaci, uživatelské účty, fakturační metadata, auditní záznamy, technické logy a obsah, který do služby nahrajete jako evidenci nebo dokumenty.",
            "U návštěvníků webu zpracováváme základní technické údaje a měření návštěvnosti v rozsahu povoleném nastavením cookies.",
          ],
        },
        {
          title: "Účely a právní základy",
          body: [
            "Údaje používáme pro poskytování služby, zabezpečení účtů, fakturaci, zákaznickou podporu, plnění právních povinností a zlepšování produktu.",
            "Právním základem je plnění smlouvy, oprávněný zájem, souhlas u volitelných cookies a splnění právních povinností.",
          ],
        },
        {
          title: "Zpracovatelé",
          body: [
            "Používáme poskytovatele infrastruktury a podpůrných služeb, zejména Vercel, Neon, Clerk, Stripe, Resend, Upstash, Sentry a Loops. DPA uzavíráme tam, kde to GDPR vyžaduje.",
          ],
        },
        {
          title: "Uchování a práva",
          body: [
            "Údaje uchováváme po dobu trvání účtu a následně po dobu nezbytnou pro právní, účetní a bezpečnostní účely.",
            "Máte právo na přístup, opravu, výmaz, omezení, přenositelnost, námitku a stížnost u ÚOOÚ.",
          ],
        },
      ]}
    />
  );
}
