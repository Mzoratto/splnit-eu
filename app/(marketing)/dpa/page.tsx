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
      intro="Tento přehled slouží jako veřejný základ pro zpracovatelskou smlouvu a řízení subdodavatelů služby Splnit.eu. Nenahrazuje individuálně podepsanou smlouvu, pokud ji zákazník nebo právní předpis vyžaduje."
      sections={[
        {
          title: "Role",
          body: [
            "U zákaznických dat vystupuje Splnit Technology s.r.o. zpravidla jako zpracovatel a zákazník jako správce. U obchodní komunikace a provozních metrik vystupujeme jako správce.",
            "Zákazník určuje účel a prostředky zpracování zákaznických dat v aplikaci. Splnit.eu zpracovává tato data za účelem poskytování služby, bezpečnosti, podpory, údržby, zákonných povinností a dalších dokumentovaných pokynů zákazníka.",
          ],
        },
        {
          title: "Předmět, doba a kategorie údajů",
          body: [
            "Předmětem zpracování jsou compliance data zákazníka, uživatelské účty, auditní záznamy, evidence, dokumenty, dodavatelské a incidentní záznamy, integrační konfigurace a výsledky automatizovaných testů.",
            "Kategorie subjektů údajů mohou zahrnovat uživatele zákazníka, administrátory, zaměstnance, dodavatele, kontaktní osoby, auditované osoby a další osoby, jejichž údaje zákazník do služby vloží.",
            "Doba zpracování odpovídá době trvání smlouvy a následnému období potřebnému pro vrácení nebo výmaz dat, pokud právo nevyžaduje další uchování.",
          ],
        },
        {
          title: "Pokyny zákazníka",
          body: [
            "Osobní údaje zpracováváme pouze na základě dokumentovaných pokynů zákazníka, včetně nastavení aplikace, připojených integrací, požadavků podpory a smluvních ujednání.",
            "Pokud by pokyn podle našeho názoru porušoval GDPR nebo jiné právo EU nebo členského státu, zákazníka na to upozorníme, ledaže by nám takové upozornění zakazovalo právo.",
          ],
        },
        {
          title: "Subdodavatelé",
          body: [
            "Používáme zejména Vercel pro hosting a Blob úložiště, Neon pro databázi, Clerk pro autentizaci, Stripe pro billing, Resend a Loops pro e-mail, Upstash pro Redis, Sentry pro observabilitu, Inngest pro background jobs a PostHog pro produktovou analytiku, pokud je zapnutá.",
            "Zákazník uděluje obecné oprávnění k zapojení subdodavatelů uvedených v tomto přehledu. Podstatné změny oznamujeme přiměřeným způsobem a zákazník může vznést námitku na hello@splnit.eu.",
            "Se subdodavateli uzavíráme odpovídající smluvní závazky k ochraně osobních údajů. Za jejich zpracování odpovídáme v rozsahu požadovaném GDPR.",
          ],
        },
        {
          title: "Bezpečnostní opatření",
          body: [
            "Data oddělujeme podle organizací, používáme šifrované přenosy, šifrování integračních tokenů, auditní logy, princip nejmenších oprávnění, omezený přístup k produkčním systémům a pravidelné kontroly kritických konfigurací.",
            "Přístup pracovníků a dodavatelů je omezen podle role a potřeby. Osoby oprávněné zpracovávat osobní údaje jsou vázány mlčenlivostí nebo odpovídající zákonnou povinností důvěrnosti.",
            "Bezpečnostní incidenty vyhodnocujeme podle jejich dopadu. Pokud se incident týká zákaznických dat zpracovávaných jako zpracovatel, informujeme zákazníka bez zbytečného odkladu poté, co se o incidentu dozvíme.",
          ],
        },
        {
          title: "Pomoc zákazníkovi",
          body: [
            "V přiměřeném rozsahu pomáháme zákazníkovi plnit povinnosti podle GDPR, zejména při vyřizování žádostí subjektů údajů, zabezpečení zpracování, posuzování dopadu, oznámení porušení zabezpečení a prokazování souladu.",
            "Po skončení služby zákaznická data podle pokynů zákazníka vrátíme, zpřístupníme k exportu nebo odstraníme, pokud nám právo neukládá další uchování.",
          ],
        },
        {
          title: "Audit a informace",
          body: [
            "Zákazníkovi poskytneme informace nezbytné k doložení plnění povinností zpracovatele. Audity musí být přiměřené, předem oznámené, nesmí ohrozit bezpečnost jiných zákazníků ani zpřístupnit důvěrné informace třetích stran.",
            "Kontaktní adresa pro DPA, subdodavatele, námitky a bezpečnostní otázky je hello@splnit.eu.",
          ],
        },
      ]}
    />
  );
}
