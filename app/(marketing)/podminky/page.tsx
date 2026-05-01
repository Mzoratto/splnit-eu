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
      intro="Tyto podmínky upravují přístup ke službě Splnit.eu a používání aplikace pro compliance automatizaci. Před produkčním spuštěním musí být zkontrolovány advokátem a doplněny o finální identifikační údaje provozovatele."
      sections={[
        {
          title: "Služba",
          body: [
            "Splnit.eu poskytuje software pro správu compliance, automatizované testy, evidenci, dokumenty, reporty, Trust Center a podpůrné workflow.",
            "Výstupy služby nejsou právním poradenstvím, auditorským stanoviskem, certifikací ani zárukou splnění konkrétní zákonné nebo regulatorní povinnosti. Zákazník musí výstupy před použitím zkontrolovat a podle potřeby konzultovat s odborníkem.",
          ],
        },
        {
          title: "Účet a organizace",
          body: [
            "Uživatel odpovídá za správnost údajů v organizaci, oprávnění členů týmu a bezpečné používání přístupových údajů.",
            "Zákazník odpovídá za to, že osoby pozvané do organizace mají odpovídající oprávnění, že jsou údaje v aplikaci aktuální a že integrace připojuje pouze k systémům, které smí spravovat.",
          ],
        },
        {
          title: "Integrace a data",
          body: [
            "Při připojení integrací ukládáme pouze nezbytné tokeny, konfiguraci a výsledky testů. Zákazník odpovídá za to, že má právo dané systémy ke službě připojit.",
            "Zákazník nesmí do služby vkládat data, která nejsou potřebná pro compliance účel, ani zvláštní kategorie osobních údajů, pokud k tomu nemá platný právní základ a písemnou dohodu se Splnit.eu.",
          ],
        },
        {
          title: "Dostupnost",
          body: [
            "Službu provozujeme s cílem vysoké dostupnosti. Krátké odstávky mohou nastat kvůli údržbě, bezpečnostním zásahům nebo výpadkům poskytovatelů infrastruktury.",
            "Pokud bude sjednáno SLA, má přednost před tímto obecným popisem dostupnosti.",
          ],
        },
        {
          title: "Platby a plány",
          body: [
            "Placené plány jsou účtovány prostřednictvím Stripe podle zvoleného období a ceníku. Zákazník odpovídá za správnost fakturačních údajů a včasnou úhradu.",
            "Limity plánu, dostupné funkce a ceny mohou být měněny. Změny, které podstatně dopadají na stávající placený plán, oznámíme přiměřeným způsobem.",
          ],
        },
        {
          title: "Přijatelné použití",
          body: [
            "Službu nesmíte používat k neoprávněnému přístupu do systémů, narušování bezpečnosti, porušování práv třetích stran, ukládání nezákonného obsahu ani obcházení technických omezení.",
            "Při podezření na zneužití, bezpečnostní riziko nebo porušení podmínek můžeme přístup omezit nebo pozastavit v nezbytném rozsahu.",
          ],
        },
        {
          title: "Důvěrnost a ochrana dat",
          body: [
            "Smluvní strany chrání důvěrné informace druhé strany a používají je pouze pro účely poskytování nebo používání služby.",
            "Zpracování osobních údajů se řídí zásadami ochrany soukromí a DPA, pokud Splnit.eu vystupuje jako zpracovatel.",
          ],
        },
        {
          title: "Odpovědnost a ukončení",
          body: [
            "Služba pomáhá řídit povinnosti, ale konečná odpovědnost za splnění právních a regulatorních požadavků zůstává na zákazníkovi.",
            "Zákazník může službu přestat používat podle sjednaného plánu. Po ukončení může být přístup k účtu omezen a data budou řešena podle DPA, zásad ochrany soukromí a zákonných povinností.",
            "Konkrétní omezení odpovědnosti musí být před spuštěním doplněno do finální smluvní dokumentace advokátem.",
          ],
        },
      ]}
    />
  );
}
