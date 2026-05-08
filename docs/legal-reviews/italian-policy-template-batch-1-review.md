# Italian Policy Template Review - Batch 1

Generated: 2026-05-08T22:57:50.358Z

Purpose: advisor/legal review of draft Italian templates. These templates are not customer-facing until their `reviewStatus` is changed from `draft` to `reviewed` in code after explicit approval.

Reviewer question: is this template suitable as an Italian SMB starting point for the stated document family, and are the legal/regulatory references accurate enough for customer use?

Allowed reviewer decisions:

- `approved`: template can be promoted to customer-facing reviewed status.
- `needs_changes`: template is directionally useful but needs edits before customer use.
- `reject`: template should not be used; re-draft from scratch.

## Summary

- Total draft templates: 12
- security_policy: Politica di sicurezza delle informazioni
- incident_response: Piano di gestione degli incidenti
- record_of_processing: Registro dei trattamenti
- dpia: Valutazione d'impatto sulla protezione dei dati
- data_processing_agreement: Accordo sul trattamento dei dati
- subprocessor_list: Elenco dei sub-responsabili
- asset_inventory: Inventario degli asset
- risk_assessment: Valutazione del rischio
- acceptable_use: Politica di uso accettabile
- vendor_questionnaire: Questionario per fornitori
- business_continuity: Piano di continuita' operativa
- access_control: Politica di controllo degli accessi

## Review Decisions

| Template family | Reviewer decision | Reviewer note |
| --- | --- | --- |
| security_policy |  |  |
| incident_response |  |  |
| record_of_processing |  |  |
| dpia |  |  |
| data_processing_agreement |  |  |
| subprocessor_list |  |  |
| asset_inventory |  |  |
| risk_assessment |  |  |
| acceptable_use |  |  |
| vendor_questionnaire |  |  |
| business_continuity |  |  |
| access_control |  |  |

## Draft Templates

## Politica di sicurezza delle informazioni

- Family: `security_policy`
- Type: `security_policy`
- Jurisdiction: `IT`
- Locale: `it-IT`
- Review status: `draft`
- Source document: `tpl-004-security-policy-it-draft.md`
- Description: Bozza italiana per revisione advisor: politica InfoSec per PMI soggette a D.Lgs. 138/2024, GDPR e controlli di sicurezza proporzionati.

Control keys:

- `ctrl_mfa_all_users`
- `ctrl_privileged_access_reviewed`
- `ctrl_incident_plan_documented`
- `ctrl_data_encrypted_at_rest`
- `ctrl_patch_management`
- `ctrl_backup_tested`
- `ctrl_logging_monitoring`
- `ctrl_vendor_security_assessment`
- `ctrl_asset_inventory`

Sections:

### 1. Identificazione del documento

| Field |
| --- |
| Organizzazione |
| {{tenant.legalIdentifier}} |
| Versione |
| Data di emissione |
| Approvato da |
| Prossima revisione |

### 2. Scopo e campo di applicazione

La presente politica definisce le regole minime per proteggere persone, sistemi, dati, fornitori e servizi cloud dell'organizzazione.

### 3. Riferimenti normativi

La politica e' una bozza operativa da verificare rispetto a {{jurisdiction.nis2Citation}}, {{jurisdiction.gdprCitation}}, Codice Privacy e indicazioni ACN applicabili.

### 4. Ruoli e responsabilita'

| Field |
| --- |
| Direzione |
| Responsabile sicurezza informatica |
| Responsabili di processo |
| Utenti |
| Fornitori critici |

### 5. Controllo degli accessi

Gli account usano MFA ove applicabile, i privilegi sono limitati al necessario e gli accessi vengono riesaminati periodicamente.

### 6. Protezione dei dati e crittografia

I dati sensibili sono classificati, protetti e cifrati in funzione del rischio, dello scopo del trattamento e degli obblighi contrattuali o normativi.

### 7. Vulnerabilita' e modifiche

Le vulnerabilita' critiche sono prese in carico, priorizzate e corrette; le modifiche ai sistemi di produzione sono approvate e tracciabili.

### 8. Fornitori

I fornitori con accesso a dati, reti o sistemi sono valutati prima dell'attivazione e vincolati da requisiti di sicurezza, notifica incidenti e continuita'.

### 9. Monitoraggio, log e riesame

| Field |
| --- |
| Fonti di log |
| Responsabile alert |
| Periodo di conservazione |
| Data ultimo riesame |
| Azioni correttive |

## Piano di gestione degli incidenti

- Family: `incident_response`
- Type: `incident_response`
- Jurisdiction: `IT`
- Locale: `it-IT`
- Review status: `draft`
- Source document: `tpl-006-incident-response-it-draft.md`
- Description: Bozza italiana per revisione advisor: piano di risposta agli incidenti con escalation, conservazione evidenze e valutazione delle notifiche ACN/Garante.

Control keys:

- `ctrl_incident_plan_documented`
- `ctrl_incident_72h_notification`
- `ctrl_logging_monitoring`
- `ctrl_security_event_alerting`
- `ctrl_business_continuity_plan`

Sections:

### 1. Scopo e ruoli

| Field |
| --- |
| Incident manager |
| Referente IT |
| Referente privacy |
| Direzione |
| Contatti dei fornitori critici |

### 2. Classificazione dell'incidente

| Field |
| --- |
| Basso |
| Medio |
| Alto |
| Critico |
| Criteri per incidente significativo NIS |
| Criteri per violazione dei dati personali |

### 3. Prima risposta

Mettere in sicurezza persone e sistemi, limitare l'impatto, preservare le evidenze e attivare i ruoli responsabili.

### 4. Valutazione notifiche

Gli incidenti cyber sono valutati rispetto a {{jurisdiction.nis2Citation}} e alle indicazioni ACN; le violazioni di dati personali sono valutate rispetto a {{jurisdiction.gdprCitation}} art. 33 e 34 e alle indicazioni del {{jurisdiction.dataProtectionAuthority}}.

### 5. Timeline operativa

| Field |
| --- |
| Ora di rilevazione |
| Ora di triage |
| Decisione su preallarme |
| Decisione su notifica |
| Decisione su relazione finale |
| Responsabile decisione |

### 6. Evidenze e comunicazioni

| Field |
| --- |
| Sistemi coinvolti |
| Log conservati |
| Dati personali coinvolti |
| Misure adottate |
| Comunicazioni interne |
| Comunicazioni esterne |

### 7. Riesame post-incidente

| Field |
| --- |
| Causa radice |
| Azioni correttive |
| Responsabile |
| Scadenza |
| Data verifica efficacia |

## Registro dei trattamenti

- Family: `record_of_processing`
- Type: `record_of_processing`
- Jurisdiction: `IT`
- Locale: `it-IT`
- Review status: `draft`
- Source document: `tpl-007-record-of-processing-it-draft.md`
- Description: Bozza italiana per revisione advisor: registro delle attivita' di trattamento ai sensi del GDPR art. 30 e del Codice Privacy.

Control keys:

- `ctrl_data_processing_inventory`
- `ctrl_privacy_notice_current`
- `ctrl_data_retention_schedule`
- `ctrl_supplier_contract_security`

Sections:

### 1. Identificazione del titolare

| Field |
| --- |
| Organizzazione |
| {{tenant.legalIdentifier}} |
| {{jurisdiction.address}} |
| Referente privacy |
| {{jurisdiction.contactEmail}} |

### 2. Attivita' di trattamento

| Field |
| --- |
| Nome trattamento |
| Finalita' |
| Base giuridica |
| Categorie di interessati |
| Categorie di dati |
| Categorie di destinatari |

### 3. Conservazione e trasferimenti

| Field |
| --- |
| Periodo di conservazione |
| Criterio di cancellazione |
| Trasferimenti extra SEE |
| Garanzie applicabili |

### 4. Responsabili e misure di sicurezza

| Field |
| --- |
| Responsabili del trattamento |
| Sub-responsabili rilevanti |
| Misure tecniche e organizzative |
| Data ultimo riesame |

## Valutazione d'impatto sulla protezione dei dati

- Family: `dpia`
- Type: `dpia`
- Jurisdiction: `IT`
- Locale: `it-IT`
- Review status: `draft`
- Source document: `tpl-008-dpia-it-draft.md`
- Description: Bozza italiana per revisione advisor: DPIA per trattamenti che possono presentare un rischio elevato per diritti e liberta'.

Control keys:

- `ctrl_dpia_process`
- `ctrl_data_processing_inventory`
- `ctrl_data_classification`
- `ctrl_data_encrypted_at_rest`
- `ctrl_dsr_process`

Sections:

### 1. Descrizione del trattamento

| Field |
| --- |
| Nome trattamento |
| Titolare |
| Responsabile interno |
| Finalita' |
| Categorie di dati |
| Interessati coinvolti |

### 2. Necessita' e proporzionalita'

| Field |
| --- |
| Base giuridica |
| Minimizzazione dati |
| Limitazione conservazione |
| Informativa agli interessati |
| Gestione diritti |

### 3. Valutazione dei rischi

| Field |
| --- |
| Scenario di rischio |
| Probabilita' |
| Impatto |
| Misure esistenti |
| Rischio residuo |

### 4. Decisione e consultazione

| Field |
| --- |
| Misure aggiuntive |
| Consultazione DPO |
| Consultazione {{jurisdiction.dataProtectionAuthority}} |
| Decisione finale |
| Data riesame |

## Accordo sul trattamento dei dati

- Family: `data_processing_agreement`
- Type: `data_processing_agreement`
- Jurisdiction: `IT`
- Locale: `it-IT`
- Review status: `draft`
- Source document: `tpl-009-dpa-it-draft.md`
- Description: Bozza italiana per revisione advisor: DPA tra titolare e responsabile del trattamento, da adattare al rapporto contrattuale specifico.

Control keys:

- `ctrl_supplier_contract_security`
- `ctrl_vendor_security_assessment`
- `ctrl_data_processing_inventory`
- `ctrl_incident_72h_notification`

Sections:

### 1. Parti e ruolo privacy

| Field |
| --- |
| Titolare del trattamento |
| Responsabile del trattamento |
| Oggetto del servizio |
| Durata del trattamento |
| Contatti privacy |

### 2. Istruzioni documentate

Il responsabile tratta i dati personali solo secondo istruzioni documentate del titolare, salvo obblighi di legge applicabili.

### 3. Misure di sicurezza

| Field |
| --- |
| Controllo accessi |
| Crittografia |
| Backup |
| Logging |
| Gestione incidenti |

### 4. Sub-responsabili e assistenza

| Field |
| --- |
| Autorizzazione sub-responsabili |
| Obbligo di informazione |
| Assistenza diritti interessati |
| Assistenza DPIA |
| Cancellazione o restituzione dati |

## Elenco dei sub-responsabili

- Family: `subprocessor_list`
- Type: `subprocessor_list`
- Jurisdiction: `IT`
- Locale: `it-IT`
- Review status: `draft`
- Source document: `tpl-010-subprocessors-it-draft.md`
- Description: Bozza italiana per revisione advisor: elenco operativo dei sub-responsabili con finalita', localizzazione e misure rilevanti.

Control keys:

- `ctrl_supplier_contract_security`
- `ctrl_vendor_security_assessment`
- `ctrl_supplier_monitoring`

Sections:

### 1. Informazioni generali

| Field |
| --- |
| Organizzazione |
| {{tenant.legalIdentifier}} |
| Versione elenco |
| Data ultimo aggiornamento |
| Contatto per opposizioni |

### 2. Sub-responsabili

| Field |
| --- |
| Nome fornitore |
| Servizio |
| Finalita' del trattamento |
| Categorie di dati |
| Paese o regione |
| Base trasferimento |

### 3. Controlli e riesame

| Field |
| --- |
| DPA firmato |
| Valutazione sicurezza |
| Data ultimo riesame |
| Rischi aperti |

## Inventario degli asset

- Family: `asset_inventory`
- Type: `asset_inventory`
- Jurisdiction: `IT`
- Locale: `it-IT`
- Review status: `draft`
- Source document: `tpl-011-asset-inventory-it-draft.md`
- Description: Bozza italiana per revisione advisor: inventario di sistemi, dati, proprietari e criticita' per NIS2, GDPR e ISO 27001.

Control keys:

- `ctrl_asset_inventory`
- `ctrl_data_classification`
- `ctrl_data_processing_inventory`
- `ctrl_business_continuity_plan`

Sections:

### 1. Asset applicativi e infrastrutturali

| Field |
| --- |
| Nome asset |
| Tipo |
| Owner |
| Fornitore |
| Ambiente |
| Criticita' |

### 2. Dati e dipendenze

| Field |
| --- |
| Categorie di dati |
| Dati personali |
| Integrazioni |
| Dipendenze critiche |
| Backup |

### 3. Controlli applicati

| Field |
| --- |
| MFA |
| Logging |
| Crittografia |
| Monitoraggio vulnerabilita' |
| Ultimo riesame |

## Valutazione del rischio

- Family: `risk_assessment`
- Type: `risk_assessment`
- Jurisdiction: `IT`
- Locale: `it-IT`
- Review status: `draft`
- Source document: `tpl-012-risk-assessment-it-draft.md`
- Description: Bozza italiana per revisione advisor: valutazione dei rischi cybersecurity e privacy con piano di trattamento.

Control keys:

- `ctrl_risk_treatment_plan`
- `ctrl_asset_inventory`
- `ctrl_vulnerability_management`
- `ctrl_vendor_security_assessment`
- `ctrl_business_continuity_plan`

Sections:

### 1. Ambito

| Field |
| --- |
| Processo o asset |
| Owner |
| Framework applicabili |
| Data valutazione |
| Metodo usato |

### 2. Scenario di rischio

| Field |
| --- |
| Minaccia |
| Vulnerabilita' |
| Impatto potenziale |
| Probabilita' |
| Livello rischio inerente |

### 3. Trattamento

| Field |
| --- |
| Controlli esistenti |
| Azioni aggiuntive |
| Owner azione |
| Scadenza |
| Rischio residuo |
| Decisione accettazione |

## Politica di uso accettabile

- Family: `acceptable_use`
- Type: `acceptable_use`
- Jurisdiction: `IT`
- Locale: `it-IT`
- Review status: `draft`
- Source document: `tpl-013-acceptable-use-it-draft.md`
- Description: Bozza italiana per revisione advisor: regole di uso accettabile per account, dispositivi, dati, cloud e strumenti AI.

Control keys:

- `ctrl_security_training_annual`
- `ctrl_password_policy`
- `ctrl_mfa_all_users`
- `ctrl_remote_work_policy`
- `ctrl_ai_prohibited_practices_review`

Sections:

### 1. Ambito e destinatari

La politica si applica a dipendenti, collaboratori e altri utenti autorizzati che accedono a sistemi, dati o servizi aziendali.

### 2. Account e autenticazione

Gli utenti proteggono le credenziali, usano MFA quando richiesto e non condividono account o token di accesso.

### 3. Dispositivi, cloud e dati

| Field |
| --- |
| Dispositivi autorizzati |
| Uso servizi cloud |
| Classificazione dati |
| Condivisione esterna |
| Segnalazione smarrimenti |

### 4. Uso di strumenti AI

Informazioni riservate o dati personali non devono essere inseriti in strumenti AI non approvati. Ogni uso rilevante deve rispettare la politica AI aziendale.

## Questionario per fornitori

- Family: `vendor_questionnaire`
- Type: `vendor_questionnaire`
- Jurisdiction: `IT`
- Locale: `it-IT`
- Review status: `draft`
- Source document: `tpl-014-vendor-questionnaire-it-draft.md`
- Description: Bozza italiana per revisione advisor: questionario di sicurezza e privacy per fornitori che trattano dati o supportano servizi critici.

Control keys:

- `ctrl_vendor_security_assessment`
- `ctrl_supplier_contract_security`
- `ctrl_supplier_monitoring`
- `ctrl_incident_72h_notification`

Sections:

### 1. Profilo fornitore

| Field |
| --- |
| Ragione sociale |
| Servizio fornito |
| Paesi di trattamento |
| Certificazioni |
| Contatto sicurezza |

### 2. Sicurezza tecnica

| Field |
| --- |
| MFA amministratori |
| Crittografia dati |
| Backup |
| Logging |
| Vulnerability management |
| Penetration test |

### 3. Privacy e sub-fornitori

| Field |
| --- |
| DPA disponibile |
| Sub-responsabili |
| Trasferimenti extra SEE |
| Gestione richieste interessati |
| Cancellazione dati |

### 4. Incidenti e continuita'

| Field |
| --- |
| Processo incident response |
| Tempi di notifica |
| BCP/DR testato |
| Ultimo test |

## Piano di continuita' operativa

- Family: `business_continuity`
- Type: `business_continuity`
- Jurisdiction: `IT`
- Locale: `it-IT`
- Review status: `draft`
- Source document: `tpl-015-business-continuity-it-draft.md`
- Description: Bozza italiana per revisione advisor: piano BCP/DR per servizi, fornitori, backup e ruoli di ripristino.

Control keys:

- `ctrl_business_continuity_plan`
- `ctrl_backup_tested`
- `ctrl_backup_policy`
- `ctrl_disaster_recovery_test`
- `ctrl_supplier_monitoring`

Sections:

### 1. Servizi critici

| Field |
| --- |
| Servizio |
| Owner |
| RTO |
| RPO |
| Dipendenze |
| Clienti o processi impattati |

### 2. Strategia di continuita'

| Field |
| --- |
| Soluzione alternativa |
| Backup |
| Fornitori critici |
| Canali di comunicazione |
| Responsabili attivazione |

### 3. Test e riesame

| Field |
| --- |
| Scenario testato |
| Data test |
| Esito |
| Azioni correttive |
| Prossimo test |

## Politica di controllo degli accessi

- Family: `access_control`
- Type: `access_control`
- Jurisdiction: `IT`
- Locale: `it-IT`
- Review status: `draft`
- Source document: `tpl-016-access-control-it-draft.md`
- Description: Bozza italiana per revisione advisor: controllo accessi per identita', privilegi, onboarding, offboarding e riesami periodici.

Control keys:

- `ctrl_mfa_all_users`
- `ctrl_privileged_access_reviewed`
- `ctrl_offboarding_access_revoked`
- `ctrl_guest_access_controlled`
- `ctrl_identity_lifecycle_policy`
- `ctrl_conditional_access`

Sections:

### 1. Principi

Gli accessi sono concessi secondo necessita' operativa, minimo privilegio, separazione dei ruoli e tracciabilita'.

### 2. Ciclo di vita identita'

| Field |
| --- |
| Richiesta accesso |
| Approvazione |
| Provisioning |
| Modifica ruolo |
| Offboarding |
| Revoca emergenza |

### 3. Accessi privilegiati

| Field |
| --- |
| Account amministrativi |
| MFA |
| Logging |
| Accesso break-glass |
| Riesame periodico |

### 4. Accessi terzi e ospiti

| Field |
| --- |
| Sponsor interno |
| Scadenza accesso |
| Restrizioni |
| Riesame |
| Revoca |

