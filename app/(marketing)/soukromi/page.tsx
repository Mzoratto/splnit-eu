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
      intro="Tyto zásady popisují, jak provozovatel Splnit.eu jako OSVČ zpracovává osobní údaje návštěvníků webu, uživatelů aplikace, obchodních kontaktů a osob, jejichž údaje zákazník do služby vloží. Finální identifikační údaje provozovatele musí být doplněné před produkčním spuštěním."
      sections={[
        {
          title: "Správce údajů",
          body: [
            "Správcem pro web, obchodní komunikaci, účet zákazníka, fakturaci a provozní bezpečnost je provozovatel Splnit.eu jako OSVČ, Česká republika. Jméno, IČO, ARES odkaz a adresa budou doplněné před produkčním spuštěním. Pro dotazy k ochraně osobních údajů nás kontaktujte na hello@splnit.eu.",
            "U osobních údajů, které zákazník vkládá do aplikace jako evidence, dokumenty, dodavatelské dotazníky nebo auditní záznamy, vystupuje zákazník zpravidla jako správce a Splnit.eu jako zpracovatel podle DPA.",
            "Pověřenec pro ochranu osobních údajů není ke dni zveřejnění jmenován. Pokud se tato skutečnost změní, kontaktní údaj zde doplníme.",
          ],
        },
        {
          title: "Jaké údaje zpracováváme",
          body: [
            "Zpracováváme identifikační a kontaktní údaje, údaje o organizaci, uživatelské účty, role a oprávnění, fakturační metadata, auditní záznamy, technické logy, bezpečnostní události a obsah, který do služby nahrajete jako evidenci nebo dokumenty.",
            "U návštěvníků webu zpracováváme základní technické údaje, jazyk, nastavení cookies a měření návštěvnosti pouze v rozsahu povoleném nastavením cookies.",
            "V rámci integrací mohou být zpracovány technické údaje z připojených systémů, například stav MFA, konfigurace zabezpečení, metadata repozitářů, výsledky cloudových kontrol a časové údaje synchronizací.",
          ],
        },
        {
          title: "Účely a právní základy",
          body: [
            "Údaje používáme pro poskytování služby, správu účtů a organizací, zabezpečení účtů, automatizované compliance kontroly, fakturaci, zákaznickou podporu, komunikaci se zájemci, plnění právních povinností, detekci zneužití a zlepšování produktu.",
            "Právním základem je zejména plnění smlouvy, oprávněný zájem na bezpečném provozu služby a rozvoji produktu, splnění právních povinností v účetnictví a daních a souhlas u volitelných cookies nebo marketingové komunikace, pokud je souhlas vyžadován.",
            "Pokud zpracování probíhá na základě oprávněného zájmu, jde hlavně o bezpečnost, prevenci zneužití, základní provozní analytiku, vymáhání právních nároků a komunikaci se stávajícími zákazníky v přiměřeném rozsahu.",
          ],
        },
        {
          title: "Příjemci a zpracovatelé",
          body: [
            "Používáme poskytovatele infrastruktury a podpůrných služeb, zejména Vercel, Neon, Clerk, Stripe, Resend, Loops, Upstash, Sentry, Vercel Blob, Inngest a PostHog, pokud jsou dané služby v produkčním prostředí zapnuté.",
            "Osobní údaje můžeme sdílet také s právními, účetními, bezpečnostními a technickými poradci, pokud je to nezbytné pro provoz služby, splnění povinností nebo ochranu práv.",
            "Přehled hlavních subdodavatelů pro zákaznická data uvádíme na stránce DPA a subdodavatelé.",
          ],
        },
        {
          title: "Předávání mimo EU/EHP",
          body: [
            "Někteří poskytovatelé mohou zpracovávat údaje mimo EU/EHP. V takovém případě se spoléháme na vhodné záruky, například rozhodnutí o odpovídající ochraně, standardní smluvní doložky, certifikace nebo doplňková technická a organizační opatření podle povahy služby.",
            "Konkrétní umístění zpracování a mechanismy předávání se mohou lišit podle zvolených poskytovatelů a produkční konfigurace.",
          ],
        },
        {
          title: "Uchování",
          body: [
            "Údaje zákaznického účtu uchováváme po dobu trvání smlouvy a následně po dobu nezbytnou pro právní, účetní, daňové, bezpečnostní a reklamační účely.",
            "Fakturační a účetní údaje uchováváme po zákonem požadovanou dobu. Bezpečnostní logy a auditní záznamy uchováváme po dobu přiměřenou účelu zabezpečení, vyšetření incidentů a prokázání compliance kroků.",
            "Údaje zpracovávané jako zpracovatel mažeme nebo vracíme podle pokynů zákazníka a DPA, pokud nám další uchování neukládá právo.",
          ],
        },
        {
          title: "Práva subjektů údajů",
          body: [
            "Máte právo požadovat přístup, opravu, výmaz, omezení zpracování, přenositelnost, vznést námitku a nebýt předmětem rozhodnutí založeného výhradně na automatizovaném zpracování, pokud se tato práva podle GDPR použijí.",
            "Souhlas můžete kdykoli odvolat bez vlivu na zákonnost zpracování před odvoláním. U cookies můžete volbu změnit na stránce Cookies.",
            "Žádosti posílejte na hello@splnit.eu. Odpovíme bez zbytečného odkladu, zpravidla do jednoho měsíce; v odůvodněných případech lze lhůtu prodloužit podle GDPR.",
            "Máte právo podat stížnost u Úřadu pro ochranu osobních údajů, Pplk. Sochora 27, 170 00 Praha 7, uoou.gov.cz.",
          ],
        },
        {
          title: "Automatizované rozhodování",
          body: [
            "Služba počítá compliance skóre, klasifikace rizik a návrhy odpovědí do dotazníků. Tyto výstupy slouží jako pracovní podklad pro zákazníka a samy o sobě nezakládají právní účinky vůči fyzickým osobám.",
            "Výstupy z automatizace by měl zákazník před použitím zkontrolovat a doplnit vlastním posouzením.",
          ],
        },
      ]}
    />
  );
}
