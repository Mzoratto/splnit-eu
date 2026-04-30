import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Podmínky používání | Splnit.eu",
  description: "Základní podmínky používání služby Splnit.eu.",
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Podmínky používání"
      intro="Tyto podmínky upravují přístup ke službě Splnit.eu a používání aplikace pro compliance automatizaci."
      sections={[
        {
          title: "Služba",
          body: [
            "Splnit.eu poskytuje software pro správu compliance, automatizované testy, evidenci, dokumenty a reporty. Výstupy služby nejsou právním poradenstvím.",
          ],
        },
        {
          title: "Účet a organizace",
          body: [
            "Uživatel odpovídá za správnost údajů v organizaci, oprávnění členů týmu a bezpečné používání přístupových údajů.",
          ],
        },
        {
          title: "Integrace a data",
          body: [
            "Při připojení integrací ukládáme pouze nezbytné tokeny, konfiguraci a výsledky testů. Zákazník odpovídá za to, že má právo dané systémy ke službě připojit.",
          ],
        },
        {
          title: "Dostupnost",
          body: [
            "Službu provozujeme s cílem vysoké dostupnosti. Krátké odstávky mohou nastat kvůli údržbě, bezpečnostním zásahům nebo výpadkům poskytovatelů infrastruktury.",
          ],
        },
        {
          title: "Odpovědnost",
          body: [
            "Služba pomáhá řídit povinnosti, ale konečná odpovědnost za splnění právních a regulatorních požadavků zůstává na zákazníkovi.",
          ],
        },
      ]}
    />
  );
}
