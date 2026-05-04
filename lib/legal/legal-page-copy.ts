import type { Metadata } from "next";
import type { Locale } from "@/i18n/routing";
import type { LegalSection } from "@/components/legal/legal-page";

export type LegalPageKey = "cookies" | "dpa" | "privacy" | "terms";

type LegalPageCopy = {
  buttonLabel?: string;
  intro: string;
  metadata: Pick<Metadata, "description" | "title">;
  sections: LegalSection[];
  title: string;
};

const legalPageCopy: Record<LegalPageKey, Record<Locale, LegalPageCopy>> = {
  cookies: {
    "cs-CZ": {
      title: "Cookies",
      intro:
        "Cookies používáme střídmě: pro fungování webu, přihlášení, uložení jazykové volby, uložení volby cookie banneru a volitelné měření výkonu a návštěvnosti.",
      buttonLabel: "Změnit nastavení cookies",
      metadata: {
        title: "Cookies | Splnit.eu",
        description:
          "Přehled používání cookies a měření návštěvnosti na Splnit.eu.",
      },
      sections: [
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
      ],
    },
    "en-EU": {
      title: "Cookies",
      intro:
        "We use cookies sparingly: to run the website, keep sign-in working, remember your language, store your cookie choice, and optionally measure performance and traffic.",
      buttonLabel: "Change cookie settings",
      metadata: {
        title: "Cookies | Splnit.eu",
        description:
          "How Splnit.eu uses cookies, consent storage, and optional traffic measurement.",
      },
      sections: [
        {
          title: "Required cookies",
          body: [
            "Required cookies keep the session, language, security settings, and cookie banner choice. Without them the service may not work correctly, and consent is not required for this storage under electronic communications rules.",
            "Examples include NEXT_LOCALE for language, cc-cookie-consent for the banner choice, and authentication cookies from the sign-in provider when you use the app.",
          ],
        },
        {
          title: "Optional traffic and performance measurement",
          body: [
            "Vercel Web Analytics and Speed Insights are used for aggregate measurement of visits, loading speed, and Core Web Vitals only after consent in the cookie banner.",
            "We do not use this data to sell advertising profiles or share advertising audiences with ad networks.",
            "If another analytics or product tool is enabled in a specific environment, such as PostHog, it must stay tied to valid consent or another lawful basis and be added to this overview.",
          ],
        },
        {
          title: "Managing consent",
          body: [
            "Consent or rejection is stored in the cc-cookie-consent cookie for 180 days.",
            "Consent is not required to access the website or app. Rejecting optional measurement does not affect core service functionality.",
            "You can change your choice with the button below or by deleting cookies in your browser.",
          ],
        },
      ],
    },
    "it-IT": {
      title: "Cookie",
      intro:
        "Usiamo i cookie in modo limitato: per far funzionare il sito, mantenere l'accesso, ricordare la lingua, salvare la scelta sui cookie e misurare facoltativamente prestazioni e traffico.",
      buttonLabel: "Modifica le impostazioni cookie",
      metadata: {
        title: "Cookie | Splnit.eu",
        description:
          "Come Splnit.eu usa cookie, consenso e misurazione facoltativa del traffico.",
      },
      sections: [
        {
          title: "Cookie necessari",
          body: [
            "I cookie necessari mantengono sessione, lingua, impostazioni di sicurezza e scelta del banner. Senza questi cookie il servizio potrebbe non funzionare correttamente; per conservarli non serve consenso secondo le regole sulle comunicazioni elettroniche.",
            "Esempi: NEXT_LOCALE per la lingua, cc-cookie-consent per salvare la scelta del banner e cookie di autenticazione del provider di login quando usate l'app.",
          ],
        },
        {
          title: "Misurazione facoltativa di traffico e prestazioni",
          body: [
            "Vercel Web Analytics e Speed Insights sono usati per misurazioni aggregate di visite, velocità di caricamento e Core Web Vitals solo dopo il consenso nel banner cookie.",
            "Non usiamo questi dati per vendere profili pubblicitari o condividere audience con reti pubblicitarie.",
            "Se in un ambiente specifico abilitiamo altri strumenti analytics o prodotto, ad esempio PostHog, devono restare legati al consenso valido o a un'altra base giuridica e devono essere aggiunti a questa panoramica.",
          ],
        },
        {
          title: "Gestione del consenso",
          body: [
            "Il consenso o il rifiuto viene salvato nel cookie cc-cookie-consent per 180 giorni.",
            "Il consenso non è una condizione per accedere al sito o all'app. Il rifiuto della misurazione facoltativa non incide sulle funzioni principali del servizio.",
            "Potete modificare la scelta con il pulsante qui sotto o eliminando i cookie nel browser.",
          ],
        },
      ],
    },
  },
  dpa: {
    "cs-CZ": {
      title: "DPA a subdodavatelé",
      intro:
        "Tento přehled slouží jako veřejný základ pro zpracovatelskou smlouvu a řízení subdodavatelů služby Splnit.eu. Nenahrazuje individuálně podepsanou smlouvu, pokud ji zákazník nebo právní předpis vyžaduje.",
      metadata: {
        title: "DPA a subdodavatelé | Splnit.eu",
        description:
          "Přehled zpracovatelské smlouvy a subdodavatelů Splnit.eu.",
      },
      sections: [
        {
          title: "Role",
          body: [
            "U zákaznických dat vystupuje provozovatel Splnit.eu jako OSVČ zpravidla jako zpracovatel a zákazník jako správce. U obchodní komunikace a provozních metrik vystupujeme jako správce. Finální jméno, IČO, ARES odkaz a adresa provozovatele musí být doplněné před produkčním spuštěním.",
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
      ],
    },
    "en-EU": {
      title: "DPA and Sub-processors",
      intro:
        "This overview is the public baseline for Splnit.eu data processing terms and sub-processor management. It does not replace an individually signed agreement where a customer or applicable law requires one.",
      metadata: {
        title: "DPA and Sub-processors | Splnit.eu",
        description:
          "Overview of Splnit.eu data processing terms and sub-processors.",
      },
      sections: [
        {
          title: "Roles",
          body: [
            "For customer data, the Splnit.eu operator, acting as a Czech sole trader, usually acts as processor and the customer as controller. For business communication and operational metrics, we act as controller. The final operator name, business ID, ARES link, and address must be completed before production launch.",
            "The customer determines the purposes and means of processing customer data in the app. Splnit.eu processes that data to provide the service, security, support, maintenance, legal compliance, and other documented customer instructions.",
          ],
        },
        {
          title: "Subject matter, duration, and data categories",
          body: [
            "Processing covers customer compliance data, user accounts, audit logs, evidence, documents, vendor and incident records, integration configuration, and automated test results.",
            "Categories of data subjects may include customer users, administrators, employees, suppliers, contact persons, audited persons, and other people whose data the customer places in the service.",
            "The processing period follows the contract term and the later period needed to return or delete data, unless law requires further retention.",
          ],
        },
        {
          title: "Customer instructions",
          body: [
            "We process personal data only on documented customer instructions, including app settings, connected integrations, support requests, and contractual arrangements.",
            "If we believe an instruction violates GDPR or other EU or member-state law, we will notify the customer unless the law prohibits that notice.",
          ],
        },
        {
          title: "Sub-processors",
          body: [
            "We mainly use Vercel for hosting and Blob storage, Neon for the database, Clerk for authentication, Stripe for billing, Resend and Loops for email, Upstash for Redis, Sentry for observability, Inngest for background jobs, and PostHog for product analytics where enabled.",
            "The customer gives general authorisation to use the sub-processors listed in this overview. We announce material changes in a reasonable way, and the customer may object at hello@splnit.eu.",
            "We put appropriate data-protection commitments in place with sub-processors and remain responsible for their processing to the extent required by GDPR.",
          ],
        },
        {
          title: "Security measures",
          body: [
            "We separate data by organisation, use encrypted transport, encrypt integration tokens, keep audit logs, apply least-privilege access, restrict production access, and regularly review critical configurations.",
            "Staff and supplier access is limited by role and need. People authorised to process personal data are bound by confidentiality or an equivalent legal duty.",
            "Security incidents are assessed by impact. If an incident affects customer data processed as processor, we notify the customer without undue delay after becoming aware of it.",
          ],
        },
        {
          title: "Customer assistance",
          body: [
            "Within reasonable scope, we help the customer meet GDPR obligations, especially for data-subject requests, processing security, impact assessments, breach notifications, and demonstrating compliance.",
            "At the end of the service, customer data will be returned, made available for export, or deleted according to customer instructions unless law requires further retention.",
          ],
        },
        {
          title: "Audit and information",
          body: [
            "We provide information needed to demonstrate processor compliance. Audits must be reasonable, announced in advance, and must not compromise other customers' security or expose third-party confidential information.",
            "The contact address for DPA questions, sub-processors, objections, and security questions is hello@splnit.eu.",
          ],
        },
      ],
    },
    "it-IT": {
      title: "DPA e sub-responsabili",
      intro:
        "Questa panoramica è la base pubblica per i termini di trattamento dati di Splnit.eu e per la gestione dei sub-responsabili. Non sostituisce un accordo firmato individualmente quando richiesto dal cliente o dalla legge applicabile.",
      metadata: {
        title: "DPA e sub-responsabili | Splnit.eu",
        description:
          "Panoramica dei termini di trattamento dati e dei sub-responsabili di Splnit.eu.",
      },
      sections: [
        {
          title: "Ruoli",
          body: [
            "Per i dati dei clienti, l'operatore di Splnit.eu, come lavoratore autonomo nella Repubblica Ceca, di norma agisce come responsabile del trattamento e il cliente come titolare. Per comunicazioni commerciali e metriche operative agiamo come titolari. Nome finale dell'operatore, identificativo d'impresa, link ARES e indirizzo devono essere completati prima del lancio in produzione.",
            "Il cliente determina finalità e mezzi del trattamento dei dati cliente nell'app. Splnit.eu tratta questi dati per fornire il servizio, sicurezza, supporto, manutenzione, adempimenti legali e altre istruzioni documentate del cliente.",
          ],
        },
        {
          title: "Oggetto, durata e categorie di dati",
          body: [
            "Il trattamento riguarda dati di compliance del cliente, account utente, log audit, evidenze, documenti, registri fornitori e incidenti, configurazione delle integrazioni e risultati dei test automatici.",
            "Le categorie di interessati possono includere utenti del cliente, amministratori, dipendenti, fornitori, referenti, persone oggetto di audit e altre persone i cui dati sono inseriti dal cliente nel servizio.",
            "La durata del trattamento segue la durata del contratto e il periodo successivo necessario per restituire o cancellare i dati, salvo ulteriore conservazione richiesta dalla legge.",
          ],
        },
        {
          title: "Istruzioni del cliente",
          body: [
            "Trattiamo i dati personali solo sulla base di istruzioni documentate del cliente, incluse impostazioni dell'app, integrazioni collegate, richieste di supporto e accordi contrattuali.",
            "Se riteniamo che un'istruzione violi il GDPR o altra normativa UE o nazionale, informeremo il cliente salvo divieto di legge.",
          ],
        },
        {
          title: "Sub-responsabili",
          body: [
            "Usiamo principalmente Vercel per hosting e Blob storage, Neon per il database, Clerk per autenticazione, Stripe per billing, Resend e Loops per email, Upstash per Redis, Sentry per osservabilità, Inngest per job in background e PostHog per product analytics quando attivo.",
            "Il cliente concede autorizzazione generale all'uso dei sub-responsabili elencati in questa panoramica. Le modifiche sostanziali sono comunicate in modo ragionevole e il cliente può opporsi scrivendo a hello@splnit.eu.",
            "Con i sub-responsabili applichiamo impegni adeguati di protezione dati e restiamo responsabili del loro trattamento nei limiti richiesti dal GDPR.",
          ],
        },
        {
          title: "Misure di sicurezza",
          body: [
            "Separiamo i dati per organizzazione, usiamo trasporto cifrato, cifratura dei token di integrazione, log audit, principio del privilegio minimo, accesso limitato ai sistemi di produzione e controlli regolari delle configurazioni critiche.",
            "L'accesso di personale e fornitori è limitato per ruolo e necessità. Le persone autorizzate a trattare dati personali sono vincolate da riservatezza o obbligo legale equivalente.",
            "Gli incidenti di sicurezza sono valutati in base all'impatto. Se un incidente riguarda dati cliente trattati come responsabile, informiamo il cliente senza ingiustificato ritardo dopo averne avuto conoscenza.",
          ],
        },
        {
          title: "Assistenza al cliente",
          body: [
            "Entro limiti ragionevoli aiutiamo il cliente a rispettare gli obblighi GDPR, in particolare richieste degli interessati, sicurezza del trattamento, valutazioni d'impatto, notifiche di violazione e dimostrazione della conformità.",
            "Alla fine del servizio, i dati cliente saranno restituiti, resi disponibili per esportazione o cancellati secondo le istruzioni del cliente, salvo ulteriore conservazione richiesta dalla legge.",
          ],
        },
        {
          title: "Audit e informazioni",
          body: [
            "Forniamo le informazioni necessarie a dimostrare il rispetto degli obblighi del responsabile. Gli audit devono essere ragionevoli, annunciati in anticipo e non devono compromettere la sicurezza di altri clienti o esporre informazioni riservate di terzi.",
            "Il contatto per DPA, sub-responsabili, opposizioni e domande di sicurezza è hello@splnit.eu.",
          ],
        },
      ],
    },
  },
  privacy: {
    "cs-CZ": {
      title: "Zásady ochrany soukromí",
      intro:
        "Tyto zásady popisují, jak provozovatel Splnit.eu jako OSVČ zpracovává osobní údaje návštěvníků webu, uživatelů aplikace, obchodních kontaktů a osob, jejichž údaje zákazník do služby vloží. Finální identifikační údaje provozovatele musí být doplněné před produkčním spuštěním.",
      metadata: {
        title: "Zásady ochrany soukromí | Splnit.eu",
        description:
          "Informace o zpracování osobních údajů ve službě Splnit.eu podle GDPR.",
      },
      sections: [
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
      ],
    },
    "en-EU": {
      title: "Privacy Policy",
      intro:
        "This policy explains how the Splnit.eu operator, as a Czech sole trader, processes personal data of website visitors, app users, business contacts, and people whose data customers place in the service. Final operator identification must be completed before production launch.",
      metadata: {
        title: "Privacy Policy | Splnit.eu",
        description:
          "Information about personal data processing in Splnit.eu under GDPR.",
      },
      sections: [
        {
          title: "Controller",
          body: [
            "The controller for the website, business communication, customer account, billing, and operational security is the Splnit.eu operator as a Czech sole trader. The name, business ID, ARES link, and address will be completed before production launch. For privacy questions, contact hello@splnit.eu.",
            "For personal data customers place in the app as evidence, documents, vendor questionnaires, or audit records, the customer usually acts as controller and Splnit.eu as processor under the DPA.",
            "A data protection officer has not been appointed as of publication. If that changes, the contact details will be added here.",
          ],
        },
        {
          title: "Data we process",
          body: [
            "We process identification and contact data, organisation data, user accounts, roles and permissions, billing metadata, audit records, technical logs, security events, and content you upload as evidence or documents.",
            "For website visitors, we process basic technical data, language, cookie settings, and traffic measurement only within the scope allowed by cookie settings.",
            "Connected integrations may process technical data from linked systems, such as MFA status, security configuration, repository metadata, cloud-control results, and synchronisation timestamps.",
          ],
        },
        {
          title: "Purposes and legal bases",
          body: [
            "We use data to provide the service, manage accounts and organisations, secure accounts, run automated compliance checks, bill customers, provide support, communicate with prospects, meet legal obligations, detect abuse, and improve the product.",
            "The legal basis is mainly contract performance, legitimate interest in secure service operation and product development, legal obligations in accounting and tax, and consent for optional cookies or marketing communication where consent is required.",
            "Where processing relies on legitimate interest, it mainly covers security, abuse prevention, basic operational analytics, enforcement of legal claims, and reasonable communication with existing customers.",
          ],
        },
        {
          title: "Recipients and processors",
          body: [
            "We use infrastructure and support providers, mainly Vercel, Neon, Clerk, Stripe, Resend, Loops, Upstash, Sentry, Vercel Blob, Inngest, and PostHog where those services are enabled in production.",
            "Personal data may also be shared with legal, accounting, security, and technical advisers where needed to operate the service, meet obligations, or protect rights.",
            "The main sub-processors for customer data are listed on the DPA and Sub-processors page.",
          ],
        },
        {
          title: "Transfers outside the EU/EEA",
          body: [
            "Some providers may process data outside the EU/EEA. In those cases we rely on appropriate safeguards such as adequacy decisions, standard contractual clauses, certifications, or supplementary technical and organisational measures depending on the service.",
            "Specific processing locations and transfer mechanisms may differ by provider and production configuration.",
          ],
        },
        {
          title: "Retention",
          body: [
            "Customer account data is retained for the contract term and then for the period needed for legal, accounting, tax, security, and complaint-handling purposes.",
            "Billing and accounting data is retained for the legally required period. Security logs and audit records are retained for a period proportionate to security, incident investigation, and compliance evidence purposes.",
            "Data processed as processor is deleted or returned according to customer instructions and the DPA unless law requires further retention.",
          ],
        },
        {
          title: "Data-subject rights",
          body: [
            "You have the right to request access, rectification, erasure, restriction, portability, object to processing, and not be subject to decisions based solely on automated processing where those GDPR rights apply.",
            "Consent can be withdrawn at any time without affecting processing before withdrawal. Cookie choices can be changed on the Cookies page.",
            "Send requests to hello@splnit.eu. We respond without undue delay, usually within one month; in justified cases the period may be extended under GDPR.",
            "You have the right to lodge a complaint with the Czech Data Protection Authority at uoou.gov.cz.",
          ],
        },
        {
          title: "Automated decision-making",
          body: [
            "The service calculates compliance scores, risk classifications, and draft questionnaire responses. These outputs are working materials for the customer and do not by themselves create legal effects for natural persons.",
            "Customers should review and supplement automation outputs with their own assessment before use.",
          ],
        },
      ],
    },
    "it-IT": {
      title: "Privacy Policy",
      intro:
        "Questa informativa spiega come l'operatore di Splnit.eu, come lavoratore autonomo nella Repubblica Ceca, tratta i dati personali di visitatori del sito, utenti dell'app, contatti commerciali e persone i cui dati sono inseriti dai clienti nel servizio. L'identificazione finale dell'operatore deve essere completata prima del lancio in produzione.",
      metadata: {
        title: "Privacy Policy | Splnit.eu",
        description:
          "Informazioni sul trattamento dei dati personali in Splnit.eu secondo il GDPR.",
      },
      sections: [
        {
          title: "Titolare",
          body: [
            "Il titolare per sito web, comunicazioni commerciali, account cliente, fatturazione e sicurezza operativa è l'operatore di Splnit.eu come lavoratore autonomo nella Repubblica Ceca. Nome, identificativo d'impresa, link ARES e indirizzo saranno completati prima del lancio in produzione. Per domande privacy: hello@splnit.eu.",
            "Per i dati personali che i clienti inseriscono nell'app come evidenze, documenti, questionari fornitori o registri audit, il cliente di norma agisce come titolare e Splnit.eu come responsabile secondo il DPA.",
            "Alla data di pubblicazione non è nominato un responsabile della protezione dei dati. Se questo cambia, il contatto sarà aggiunto qui.",
          ],
        },
        {
          title: "Dati trattati",
          body: [
            "Trattiamo dati identificativi e di contatto, dati organizzativi, account utente, ruoli e permessi, metadata di fatturazione, registri audit, log tecnici, eventi di sicurezza e contenuti caricati come evidenze o documenti.",
            "Per i visitatori del sito trattiamo dati tecnici di base, lingua, impostazioni cookie e misurazione del traffico solo nei limiti consentiti dalle impostazioni cookie.",
            "Le integrazioni collegate possono trattare dati tecnici dai sistemi connessi, come stato MFA, configurazioni di sicurezza, metadata repository, risultati di controlli cloud e timestamp di sincronizzazione.",
          ],
        },
        {
          title: "Finalità e basi giuridiche",
          body: [
            "Usiamo i dati per fornire il servizio, gestire account e organizzazioni, proteggere account, eseguire controlli compliance automatici, fatturare, offrire supporto, comunicare con prospect, rispettare obblighi legali, rilevare abusi e migliorare il prodotto.",
            "La base giuridica è principalmente esecuzione del contratto, interesse legittimo alla gestione sicura del servizio e allo sviluppo del prodotto, obblighi legali contabili e fiscali e consenso per cookie facoltativi o marketing quando richiesto.",
            "Quando il trattamento si basa sull'interesse legittimo, riguarda soprattutto sicurezza, prevenzione abusi, analytics operative di base, tutela di diritti e comunicazioni ragionevoli con clienti esistenti.",
          ],
        },
        {
          title: "Destinatari e responsabili",
          body: [
            "Usiamo provider infrastrutturali e di supporto, principalmente Vercel, Neon, Clerk, Stripe, Resend, Loops, Upstash, Sentry, Vercel Blob, Inngest e PostHog quando questi servizi sono abilitati in produzione.",
            "I dati personali possono essere condivisi anche con consulenti legali, contabili, di sicurezza e tecnici quando necessario per gestire il servizio, rispettare obblighi o proteggere diritti.",
            "I principali sub-responsabili per i dati cliente sono indicati nella pagina DPA e sub-responsabili.",
          ],
        },
        {
          title: "Trasferimenti fuori UE/SEE",
          body: [
            "Alcuni provider possono trattare dati fuori UE/SEE. In questi casi ci basiamo su garanzie adeguate, come decisioni di adeguatezza, clausole contrattuali standard, certificazioni o misure tecniche e organizzative supplementari secondo il servizio.",
            "Le ubicazioni specifiche del trattamento e i meccanismi di trasferimento possono variare in base ai provider e alla configurazione di produzione.",
          ],
        },
        {
          title: "Conservazione",
          body: [
            "I dati dell'account cliente sono conservati per la durata del contratto e poi per il periodo necessario a finalità legali, contabili, fiscali, di sicurezza e gestione reclami.",
            "I dati di fatturazione e contabilità sono conservati per il periodo richiesto dalla legge. Log di sicurezza e registri audit sono conservati per un periodo proporzionato a sicurezza, indagine incidenti e prova di compliance.",
            "I dati trattati come responsabile sono cancellati o restituiti secondo istruzioni del cliente e DPA, salvo ulteriore conservazione richiesta dalla legge.",
          ],
        },
        {
          title: "Diritti degli interessati",
          body: [
            "Avete diritto a chiedere accesso, rettifica, cancellazione, limitazione, portabilità, opposizione e a non essere sottoposti a decisioni basate solo su trattamento automatizzato quando questi diritti GDPR si applicano.",
            "Il consenso può essere revocato in qualsiasi momento senza incidere sul trattamento precedente alla revoca. Le scelte cookie possono essere modificate nella pagina Cookie.",
            "Inviare richieste a hello@splnit.eu. Rispondiamo senza ingiustificato ritardo, di norma entro un mese; nei casi giustificati il termine può essere esteso secondo il GDPR.",
            "Avete diritto a presentare reclamo all'autorità ceca per la protezione dei dati su uoou.gov.cz.",
          ],
        },
        {
          title: "Decisioni automatizzate",
          body: [
            "Il servizio calcola score di compliance, classificazioni di rischio e bozze di risposte ai questionari. Questi output sono materiali di lavoro per il cliente e non producono da soli effetti giuridici sulle persone fisiche.",
            "I clienti dovrebbero rivedere e integrare gli output automatici con la propria valutazione prima dell'uso.",
          ],
        },
      ],
    },
  },
  terms: {
    "cs-CZ": {
      title: "Podmínky používání",
      intro:
        "Tyto podmínky upravují přístup ke službě Splnit.eu a používání aplikace pro compliance automatizaci. Před produkčním spuštěním musí být zkontrolovány advokátem a doplněny o finální identifikační údaje provozovatele.",
      metadata: {
        title: "Podmínky používání | Splnit.eu",
        description: "Základní podmínky používání služby Splnit.eu.",
      },
      sections: [
        {
          title: "Smluvní strany",
          body: [
            "Službu Splnit.eu provozuje OSVČ v České republice. Finální jméno, IČO, ARES odkaz a adresa provozovatele musí být doplněné před produkčním spuštěním a před použitím těchto podmínek vůči zákazníkům.",
            "Zákazníkem je osoba nebo organizace, která si vytvoří účet, objedná placený plán nebo službu používá pro vlastní compliance účel.",
          ],
        },
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
      ],
    },
    "en-EU": {
      title: "Terms of Use",
      intro:
        "These terms govern access to Splnit.eu and use of the compliance automation app. Before production launch they must be reviewed by a lawyer and completed with final operator identification.",
      metadata: {
        title: "Terms of Use | Splnit.eu",
        description: "Basic terms for using the Splnit.eu service.",
      },
      sections: [
        {
          title: "Parties",
          body: [
            "Splnit.eu is operated by a sole trader in the Czech Republic. The final name, business ID, ARES link, and address must be completed before production launch and before using these terms with customers.",
            "The customer is the person or organisation that creates an account, orders a paid plan, or uses the service for its own compliance purpose.",
          ],
        },
        {
          title: "Service",
          body: [
            "Splnit.eu provides software for compliance management, automated tests, evidence, documents, reports, Trust Center, and supporting workflows.",
            "Service outputs are not legal advice, an audit opinion, certification, or a guarantee that a specific legal or regulatory obligation is satisfied. The customer must review outputs before use and consult a specialist where needed.",
          ],
        },
        {
          title: "Account and organisation",
          body: [
            "The user is responsible for correct organisation data, team-member permissions, and secure use of credentials.",
            "The customer is responsible for ensuring that invited organisation members have appropriate authorisation, app data is current, and integrations connect only to systems the customer may manage.",
          ],
        },
        {
          title: "Integrations and data",
          body: [
            "When integrations are connected, we store only necessary tokens, configuration, and test results. The customer is responsible for having the right to connect those systems to the service.",
            "The customer must not place data in the service that is unnecessary for the compliance purpose, or special categories of personal data, unless there is a valid legal basis and written agreement with Splnit.eu.",
          ],
        },
        {
          title: "Availability",
          body: [
            "We operate the service with high availability as a goal. Short outages may happen due to maintenance, security work, or infrastructure-provider incidents.",
            "If an SLA is agreed, it takes priority over this general availability description.",
          ],
        },
        {
          title: "Payments and plans",
          body: [
            "Paid plans are billed through Stripe according to the selected period and price list. The customer is responsible for correct billing details and timely payment.",
            "Plan limits, available features, and prices may change. Changes that materially affect an existing paid plan will be announced in a reasonable way.",
          ],
        },
        {
          title: "Acceptable use",
          body: [
            "The service must not be used for unauthorised system access, security disruption, infringement of third-party rights, storing illegal content, or bypassing technical limits.",
            "Where misuse, security risk, or breach of terms is suspected, we may restrict or suspend access to the necessary extent.",
          ],
        },
        {
          title: "Confidentiality and data protection",
          body: [
            "The parties protect each other's confidential information and use it only to provide or use the service.",
            "Personal data processing is governed by the Privacy Policy and DPA where Splnit.eu acts as processor.",
          ],
        },
        {
          title: "Liability and termination",
          body: [
            "The service helps manage obligations, but final responsibility for meeting legal and regulatory requirements remains with the customer.",
            "The customer may stop using the service according to the agreed plan. After termination, account access may be restricted and data will be handled under the DPA, Privacy Policy, and legal obligations.",
            "Specific liability limitations must be added to the final contract documentation by a lawyer before launch.",
          ],
        },
      ],
    },
    "it-IT": {
      title: "Termini di utilizzo",
      intro:
        "Questi termini regolano l'accesso a Splnit.eu e l'uso dell'app di automazione compliance. Prima del lancio in produzione devono essere revisionati da un legale e completati con l'identificazione finale dell'operatore.",
      metadata: {
        title: "Termini di utilizzo | Splnit.eu",
        description: "Termini di base per l'uso del servizio Splnit.eu.",
      },
      sections: [
        {
          title: "Parti",
          body: [
            "Splnit.eu è gestito da un lavoratore autonomo nella Repubblica Ceca. Nome finale, identificativo d'impresa, link ARES e indirizzo devono essere completati prima del lancio in produzione e prima di usare questi termini con clienti.",
            "Il cliente è la persona o organizzazione che crea un account, ordina un piano a pagamento o usa il servizio per le proprie finalità di compliance.",
          ],
        },
        {
          title: "Servizio",
          body: [
            "Splnit.eu fornisce software per gestione compliance, test automatici, evidenze, documenti, report, Trust Center e workflow di supporto.",
            "Gli output del servizio non sono consulenza legale, parere di audit, certificazione o garanzia di soddisfare un obbligo legale o regolatorio specifico. Il cliente deve rivedere gli output prima dell'uso e consultare uno specialista se necessario.",
          ],
        },
        {
          title: "Account e organizzazione",
          body: [
            "L'utente è responsabile della correttezza dei dati dell'organizzazione, dei permessi dei membri del team e dell'uso sicuro delle credenziali.",
            "Il cliente è responsabile di assicurare che i membri invitati abbiano autorizzazioni adeguate, che i dati nell'app siano aggiornati e che le integrazioni colleghino solo sistemi che il cliente può gestire.",
          ],
        },
        {
          title: "Integrazioni e dati",
          body: [
            "Quando vengono collegate integrazioni, conserviamo solo token, configurazione e risultati dei test necessari. Il cliente è responsabile di avere il diritto di collegare quei sistemi al servizio.",
            "Il cliente non deve inserire nel servizio dati non necessari alla finalità compliance, né categorie particolari di dati personali, salvo base giuridica valida e accordo scritto con Splnit.eu.",
          ],
        },
        {
          title: "Disponibilità",
          body: [
            "Gestiamo il servizio con l'obiettivo di alta disponibilità. Brevi interruzioni possono avvenire per manutenzione, interventi di sicurezza o incidenti dei provider infrastrutturali.",
            "Se viene concordato uno SLA, questo prevale su questa descrizione generale della disponibilità.",
          ],
        },
        {
          title: "Pagamenti e piani",
          body: [
            "I piani a pagamento sono fatturati tramite Stripe secondo il periodo e il listino scelti. Il cliente è responsabile della correttezza dei dati di fatturazione e del pagamento puntuale.",
            "Limiti del piano, funzioni disponibili e prezzi possono cambiare. Le modifiche che incidono materialmente su un piano a pagamento esistente saranno comunicate in modo ragionevole.",
          ],
        },
        {
          title: "Uso accettabile",
          body: [
            "Il servizio non deve essere usato per accesso non autorizzato a sistemi, disturbo della sicurezza, violazione di diritti di terzi, conservazione di contenuti illegali o aggiramento di limiti tecnici.",
            "In caso di sospetto abuso, rischio di sicurezza o violazione dei termini, possiamo limitare o sospendere l'accesso nella misura necessaria.",
          ],
        },
        {
          title: "Riservatezza e protezione dati",
          body: [
            "Le parti proteggono le informazioni riservate dell'altra parte e le usano solo per fornire o usare il servizio.",
            "Il trattamento dei dati personali è regolato dalla Privacy Policy e dal DPA quando Splnit.eu agisce come responsabile.",
          ],
        },
        {
          title: "Responsabilità e cessazione",
          body: [
            "Il servizio aiuta a gestire obblighi, ma la responsabilità finale per il rispetto dei requisiti legali e regolatori resta al cliente.",
            "Il cliente può smettere di usare il servizio secondo il piano concordato. Dopo la cessazione, l'accesso all'account può essere limitato e i dati saranno gestiti secondo DPA, Privacy Policy e obblighi legali.",
            "Le limitazioni specifiche di responsabilità devono essere aggiunte alla documentazione contrattuale finale da un legale prima del lancio.",
          ],
        },
      ],
    },
  },
};

export function getLegalPageCopy(key: LegalPageKey, locale: Locale) {
  return legalPageCopy[key][locale];
}
