# Italian Policy Template Review - Batch 1

Generated: 2026-05-05T18:21:52.255Z

Purpose: advisor/legal review of draft Italian templates. These templates are not customer-facing until their `reviewStatus` is changed from `draft` to `reviewed` in code after explicit approval.

Reviewer question: is this template suitable as an Italian SMB starting point for the stated document family, and are the legal/regulatory references accurate enough for customer use?

Allowed reviewer decisions:

- `approved`: template can be promoted to customer-facing reviewed status.
- `needs_changes`: template is directionally useful but needs edits before customer use.
- `reject`: template should not be used; re-draft from scratch.

## Summary

- Total draft templates: 2
- security_policy: Politica di sicurezza delle informazioni
- incident_response: Piano di gestione degli incidenti

## Review Decisions

| Template family | Reviewer decision | Reviewer note |
| --- | --- | --- |
| security_policy |  |  |
| incident_response |  |  |

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

