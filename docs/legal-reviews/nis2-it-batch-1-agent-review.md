# NIS2 IT Agent Review Package

Generated: 2026-05-05T17:31:19.005Z

Purpose: Stage 2 and Stage 3 agent review has already run. This package is for a human reviewer to make the final mapping decision. It does not promote any row.

Source rule: official-source verification is separate. The reviewer should answer only whether the cited section genuinely supports the mapped control.

Allowed human decisions:

- `approved`: mapping correctly supports the control; promote.
- `wrong_article`: citation points to the wrong section; reject and re-research.
- `too_broad`: related but does not directly support this control; reject.
- `needs_research`: reviewer cannot decide; defer.

## Summary

- Total rows: 14
- Category filter: access_control, incident, business_continuity
- status needs_human: 14

Agent decision buckets:

- approved / high: 6
- approved / medium: 7
- too_broad / medium: 1

Stage 3 overrides:

- domain_blacklist: 2
- similarity_below_threshold: 12

## Sources

- it/dlgs-138-2024.html: 14 rows · D.Lgs. 138/2024 - Recepimento direttiva NIS2 · https://www.gazzettaufficiale.it/eli/id/2024/10/01/24G00155/SG

## Review Rows

| Queue ID | Mapping ID | Control | Category | Citation | Similarity | Agent | Stage 3 | Human decision | Human note |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 92ebbf5d-9e64-4a84-bed9-7ca522996695 | 00fadc2d-a7ff-41f9-ab84-9317229adbc8 | ctrl_mfa_all_users - MFA enabled for all user accounts | access_control | D.Lgs. 138/2024, Art. 24 | 0.189 | approved / high | overrides: similarity_below_threshold |  |  |
| df9a0cad-bc31-4d15-8af8-0ce2fcbc603a | a626c9a4-9beb-45bf-a455-4de4fbda7c41 | ctrl_root_account_mfa - Root or break-glass accounts have MFA | access_control | D.Lgs. 138/2024, Art. 24 | 0.233 | approved / high | overrides: similarity_below_threshold |  |  |
| dd078c4d-f838-42e3-9e1f-95bbf70db0d0 | 7170944b-d0fb-47ba-8082-d9c76c5b989c | ctrl_business_continuity_plan - Business continuity plan is documented | business_continuity | D.Lgs. 138/2024, Art. 24 | 0.285 | approved / high | overrides: similarity_below_threshold |  |  |
| 791133f7-2b56-47c0-9f87-464b0e54ddb3 | b2070eb6-1d4d-4151-bc0d-c025c94de46f | ctrl_incident_plan_documented - Incident response plan is documented and reviewed annually | incident | D.Lgs. 138/2024, Art. 24 | 0.289 | approved / high | overrides: similarity_below_threshold, domain_blacklist; blacklist: nis2_incident_response_or_regulatory_deadline |  |  |
| 95b782c8-5437-41b5-9ce7-066f68dfbe83 | ac2a2404-6a3b-48a8-ab10-a277b2746407 | ctrl_disaster_recovery_test - Disaster recovery is tested regularly | business_continuity | D.Lgs. 138/2024, Art. 24 | 0.293 | approved / high | overrides: similarity_below_threshold |  |  |
| 899bb005-4cbf-4456-84b2-202b582ec8f8 | c56b161d-1303-4a53-bca8-71b982369edc | ctrl_incident_72h_notification - Security incidents reported to authority within 72 hours | incident | D.Lgs. 138/2024, Art. 25 | 0.431 | approved / high | overrides: domain_blacklist; blacklist: nis2_incident_response_or_regulatory_deadline |  |  |
| d1365817-fd44-4d83-9180-f819ef93b04f | ade44031-b294-400c-a68c-0834053846dc | ctrl_cloudtrail_enabled - CloudTrail or equivalent audit logging is enabled | incident | D.Lgs. 138/2024, Art. 24 | 0.176 | approved / medium | overrides: similarity_below_threshold |  |  |
| bd191653-ee02-4dab-a74c-e72404a0c772 | 3b131de3-f2e8-4114-b70e-f6a17a7b70f1 | ctrl_guest_access_controlled - Guest and external user access is controlled | access_control | D.Lgs. 138/2024, Art. 24 | 0.206 | approved / medium | overrides: similarity_below_threshold |  |  |
| 726d4378-957a-4aa6-b1af-38f95f1f33ed | eba27255-f752-4df8-a689-93ae023f5b20 | ctrl_backup_tested - Backups are tested regularly | business_continuity | D.Lgs. 138/2024, Art. 24 | 0.208 | approved / medium | overrides: similarity_below_threshold |  |  |
| 56a4de3b-82ad-4cb2-a70e-84dd967296f0 | 83dca63d-e21b-4e3a-9367-c3888840c394 | ctrl_password_policy - Password and account lockout policy is configured | access_control | D.Lgs. 138/2024, Art. 24 | 0.239 | approved / medium | overrides: similarity_below_threshold |  |  |
| b98d09f7-8902-49bc-97aa-b27c12774d38 | 7540e25b-d165-4be7-8dbe-edded44b82a2 | ctrl_privileged_access_reviewed - Privileged user access is periodically reviewed | access_control | D.Lgs. 138/2024, Art. 24 | 0.247 | approved / medium | overrides: similarity_below_threshold |  |  |
| a6ebb608-67be-424b-ae81-91626ccdda95 | 50726763-2097-4624-8040-4ac38d96fa74 | ctrl_security_event_alerting - Security events generate alerts | incident | D.Lgs. 138/2024, Art. 24 | 0.276 | approved / medium | overrides: similarity_below_threshold |  |  |
| c6c45ec4-c821-4a8d-9b0d-2eca301f97f7 | 66e9e04c-da97-4662-be32-c462f9e88491 | ctrl_conditional_access - Conditional access is enforced for risky sign-ins | access_control | D.Lgs. 138/2024, Art. 24 | 0.281 | approved / medium | overrides: similarity_below_threshold |  |  |
| 85af9683-fe34-4ac6-8e35-9a83c1e1e05b | 34cfcd1a-68b8-49e3-8035-a777e95d480c | ctrl_logging_monitoring - Security logs are centralized | incident | D.Lgs. 138/2024, Art. 24 | 0.263 | too_broad / medium | passed/no overrides |  |  |

## Agent Reasoning

### 1. ctrl_mfa_all_users · D.Lgs. 138/2024, Art. 24

- Queue ID: `92ebbf5d-9e64-4a84-bed9-7ca522996695`
- Mapping ID: `00fadc2d-a7ff-41f9-ab84-9317229adbc8`
- Status: `needs_human`
- Regulator: ACN - Agenzia per la Cybersicurezza Nazionale
- Similarity: 0.189
- Stage 2: skeptic: approved/high (gpt-4o-mini); advocate: approved/high (gpt-4o-mini); auditor: approved/high (gpt-4o)
- Stage 3: overrides: similarity_below_threshold
- Source: it/dlgs-138-2024.html · https://www.gazzettaufficiale.it/eli/id/2024/10/01/24G00155/SG
- Source excerpt: Art. 24 Obblighi in materia di misure di gestione dei rischi per la sicurezza informatica 1. I soggetti essenziali e i soggetti importanti adottano misure tecniche, operative e organizzative adeguate e proporzionate, secondo le modalita' e i termini di cui agli articoli 30, 31 e 32, alla gestione dei rischi posti alla sicurezza dei sistemi informativi e di...

- skeptic (approved/high): Article 24 of D.Lgs. 138/2024 explicitly mentions the use of multi-factor authentication (MFA) as part of the cybersecurity risk management measures. Specifically, it states that entities must implement adequate security measures, including the use of solutions for multi-factor authentication, to ensure the security of their information systems. This directly supports the control mapping for MFA enabled for all user accounts.
- advocate (approved/high): Article 24 of D.Lgs. 138/2024 outlines the obligations for essential and important entities to adopt adequate and proportionate technical, operational, and organizational measures for cybersecurity risk management. Specifically, it mentions the use of multi-factor authentication (MFA) as part of the security measures to ensure a sufficient level of security against existing risks. The inclusion of MFA aligns with the requirement for strong access control measures, thereby supporting the mapping of the control 'MFA enabled for all user accounts' to the NIS2 Directive framework.
- auditor (approved/high): Article 24 of D.Lgs. 138/2024 outlines obligations for essential and important entities to adopt adequate and proportionate technical, operational, and organizational measures for cybersecurity risk management. Specifically, paragraph 2(i) mentions 'policies of access control' and paragraph 2(l) explicitly refers to the 'use of multi-factor authentication solutions or continuous authentication.' This directly supports the control requirement for enabling multi-factor authentication (MFA) for all user accounts, as it aligns with the directive's emphasis on implementing robust authentication mechanisms as part of cybersecurity measures.

### 2. ctrl_root_account_mfa · D.Lgs. 138/2024, Art. 24

- Queue ID: `df9a0cad-bc31-4d15-8af8-0ce2fcbc603a`
- Mapping ID: `a626c9a4-9beb-45bf-a455-4de4fbda7c41`
- Status: `needs_human`
- Regulator: ACN - Agenzia per la Cybersicurezza Nazionale
- Similarity: 0.233
- Stage 2: skeptic: approved/high (gpt-4o-mini); advocate: approved/high (gpt-4o-mini); auditor: approved/high (gpt-4o)
- Stage 3: overrides: similarity_below_threshold
- Source: it/dlgs-138-2024.html · https://www.gazzettaufficiale.it/eli/id/2024/10/01/24G00155/SG
- Source excerpt: Art. 24 Obblighi in materia di misure di gestione dei rischi per la sicurezza informatica 1. I soggetti essenziali e i soggetti importanti adottano misure tecniche, operative e organizzative adeguate e proporzionate, secondo le modalita' e i termini di cui agli articoli 30, 31 e 32, alla gestione dei rischi posti alla sicurezza dei sistemi informativi e di...

- skeptic (approved/high): Article 24 outlines obligations for essential and important entities to adopt adequate and proportionate technical, operational, and organizational measures for cybersecurity risk management. It specifically mentions the use of multi-factor authentication (MFA) as part of the security measures, which directly supports the control mapping for root or break-glass accounts having MFA. The reference to MFA aligns with the control's requirement for enhanced security of privileged accounts.
- advocate (approved/high): Article 24 of D.Lgs. 138/2024 outlines obligations regarding risk management measures for cybersecurity, emphasizing the need for adequate technical and organizational measures. It specifically mentions the use of multi-factor authentication (MFA) as part of the security measures, which directly supports the control mapping for root or break-glass accounts having MFA. This aligns with the auditor's expectations for cybersecurity risk-management measures, thus providing a strong justification for accepting this mapping.
- auditor (approved/high): The cited article, D.Lgs. 138/2024, Art. 24, outlines obligations for essential and important entities to adopt adequate and proportionate technical, operational, and organizational measures for cybersecurity risk management. Specifically, it mentions the use of multi-factor authentication (MFA) as part of these measures (Art. 24, comma 2, lettera l). This directly supports the control mapping for protecting root or break-glass accounts with MFA, as it aligns with the requirement for using MFA solutions where appropriate. The article's focus on ensuring a high level of security for information systems and networks, including access control policies, is relevant to the control's objective of securing privileged accounts.

### 3. ctrl_business_continuity_plan · D.Lgs. 138/2024, Art. 24

- Queue ID: `dd078c4d-f838-42e3-9e1f-95bbf70db0d0`
- Mapping ID: `7170944b-d0fb-47ba-8082-d9c76c5b989c`
- Status: `needs_human`
- Regulator: ACN - Agenzia per la Cybersicurezza Nazionale
- Similarity: 0.285
- Stage 2: skeptic: approved/high (gpt-4o-mini); advocate: approved/high (gpt-4o-mini); auditor: approved/high (gpt-4o)
- Stage 3: overrides: similarity_below_threshold
- Source: it/dlgs-138-2024.html · https://www.gazzettaufficiale.it/eli/id/2024/10/01/24G00155/SG
- Source excerpt: Art. 24 Obblighi in materia di misure di gestione dei rischi per la sicurezza informatica 1. I soggetti essenziali e i soggetti importanti adottano misure tecniche, operative e organizzative adeguate e proporzionate, secondo le modalita' e i termini di cui agli articoli 30, 31 e 32, alla gestione dei rischi posti alla sicurezza dei sistemi informativi e di...

- skeptic (approved/high): Article 24 outlines obligations regarding cybersecurity risk management measures, including the necessity for operational continuity and disaster recovery management. The control mapping for a documented business continuity plan aligns well with the requirements set forth in this article, particularly in relation to ensuring operational continuity and managing crises, which are explicitly mentioned as part of the cybersecurity measures.
- advocate (approved/high): Article 24 of D.Lgs. 138/2024 outlines obligations regarding cybersecurity risk management measures, including the necessity for essential and important entities to adopt adequate and proportionate technical, operational, and organizational measures. Specifically, it mentions the importance of operational continuity measures, including disaster recovery management, which directly supports the control mapping for a documented business continuity plan. The control aligns with the requirement for organizations to ensure operational continuity, thus justifying the acceptance of this mapping.
- auditor (approved/high): Article 24 of D.Lgs. 138/2024 outlines obligations for essential and important entities to adopt adequate and proportionate technical, operational, and organizational measures for managing cybersecurity risks. Specifically, it mentions the need for continuity of operations, including disaster recovery and crisis management, which aligns with the control's requirement for a documented business continuity plan. The article's focus on ensuring operational continuity and risk management supports the control's objective of having an approved plan for the recovery of critical processes, ownership, and prioritization of services. Therefore, this citation genuinely supports the control mapping.

### 4. ctrl_incident_plan_documented · D.Lgs. 138/2024, Art. 24

- Queue ID: `791133f7-2b56-47c0-9f87-464b0e54ddb3`
- Mapping ID: `b2070eb6-1d4d-4151-bc0d-c025c94de46f`
- Status: `needs_human`
- Regulator: ACN - Agenzia per la Cybersicurezza Nazionale
- Similarity: 0.289
- Stage 2: skeptic: approved/high (gpt-4o-mini); advocate: approved/high (gpt-4o-mini); auditor: approved/high (gpt-4o)
- Stage 3: overrides: similarity_below_threshold, domain_blacklist; blacklist: nis2_incident_response_or_regulatory_deadline
- Source: it/dlgs-138-2024.html · https://www.gazzettaufficiale.it/eli/id/2024/10/01/24G00155/SG
- Source excerpt: Art. 24 Obblighi in materia di misure di gestione dei rischi per la sicurezza informatica 1. I soggetti essenziali e i soggetti importanti adottano misure tecniche, operative e organizzative adeguate e proporzionate, secondo le modalita' e i termini di cui agli articoli 30, 31 e 32, alla gestione dei rischi posti alla sicurezza dei sistemi informativi e di...

- skeptic (approved/high): Article 24 outlines the obligations for essential and important entities regarding cybersecurity risk management measures, including incident management procedures. The control mapping for a documented incident response plan aligns with the requirements stated in the article, specifically under paragraph 2(b), which emphasizes the need for incident management procedures. This supports the control's focus on having a documented and reviewed incident response plan.
- advocate (approved/high): Article 24 of D.Lgs. 138/2024 outlines the obligations for essential and important entities regarding cybersecurity risk management measures. It specifically mentions the need for incident management procedures, which includes the development and review of incident response plans. The control mapping for having a documented incident response plan aligns well with the requirements set forth in this article, as it emphasizes the importance of having structured procedures in place to manage incidents effectively.
- auditor (approved/high): The citation from D.Lgs. 138/2024, Art. 24, specifically addresses the obligations related to cybersecurity risk management measures, including incident management procedures. The control in question requires an organization to have a documented incident response plan with designated roles, escalation, and review processes. Article 24 explicitly mentions the need for adequate and proportionate technical, operational, and organizational measures for risk management and incident handling, which aligns with the requirement for a documented incident response plan. Therefore, this regulatory section genuinely supports the control mapping.

### 5. ctrl_disaster_recovery_test · D.Lgs. 138/2024, Art. 24

- Queue ID: `95b782c8-5437-41b5-9ce7-066f68dfbe83`
- Mapping ID: `ac2a2404-6a3b-48a8-ab10-a277b2746407`
- Status: `needs_human`
- Regulator: ACN - Agenzia per la Cybersicurezza Nazionale
- Similarity: 0.293
- Stage 2: skeptic: approved/high (gpt-4o-mini); advocate: approved/high (gpt-4o-mini); auditor: approved/high (gpt-4o)
- Stage 3: overrides: similarity_below_threshold
- Source: it/dlgs-138-2024.html · https://www.gazzettaufficiale.it/eli/id/2024/10/01/24G00155/SG
- Source excerpt: Art. 24 Obblighi in materia di misure di gestione dei rischi per la sicurezza informatica 1. I soggetti essenziali e i soggetti importanti adottano misure tecniche, operative e organizzative adeguate e proporzionate, secondo le modalita' e i termini di cui agli articoli 30, 31 e 32, alla gestione dei rischi posti alla sicurezza dei sistemi informativi e di...

- skeptic (approved/high): Article 24 of D.Lgs. 138/2024 outlines obligations for essential and important entities regarding cybersecurity risk management measures. It specifically mentions the need for operational continuity and disaster recovery management, which aligns with the control description that states recovery procedures are tested and lead to corrective actions. This indicates that the mapping is supported by the regulatory text.
- advocate (approved/high): Article 24 of D.Lgs. 138/2024 outlines the obligations for essential and important entities regarding cybersecurity risk management measures. It specifically mentions the need for operational continuity, including disaster recovery procedures. The control mapping for 'Disaster recovery is tested regularly' aligns with the requirement for entities to implement adequate measures for disaster recovery, as stated in paragraph 2(c), which emphasizes the importance of operational continuity and disaster recovery management. Therefore, this regulatory section supports the specific control mapping.
- auditor (approved/high): The citation from D.Lgs. 138/2024, Art. 24, specifically addresses the obligations for essential and important entities to adopt adequate and proportionate technical, operational, and organizational measures for managing cybersecurity risks. It includes provisions for continuity of operations, including disaster recovery and crisis management, as outlined in Art. 24(2)(c). This directly supports the control's requirement for regular testing of disaster recovery procedures and implementing corrective actions based on test results. The article's emphasis on risk management and operational continuity aligns well with the control's focus on ensuring that disaster recovery processes are effective and regularly evaluated.

### 6. ctrl_incident_72h_notification · D.Lgs. 138/2024, Art. 25

- Queue ID: `899bb005-4cbf-4456-84b2-202b582ec8f8`
- Mapping ID: `c56b161d-1303-4a53-bca8-71b982369edc`
- Status: `needs_human`
- Regulator: ACN - Agenzia per la Cybersicurezza Nazionale
- Similarity: 0.431
- Stage 2: skeptic: approved/high (gpt-4o-mini); advocate: approved/high (gpt-4o-mini); auditor: approved/high (gpt-4o)
- Stage 3: overrides: domain_blacklist; blacklist: nis2_incident_response_or_regulatory_deadline
- Source: it/dlgs-138-2024.html · https://www.gazzettaufficiale.it/eli/id/2024/10/01/24G00155/SG
- Source excerpt: Art. 25 Obblighi in materia di notifica di incidente 1. I soggetti essenziali e i soggetti importanti notificano, senza ingiustificato ritardo, al CSIRT Italia ogni incidente che, ai sensi del comma 4, ha un impatto significativo sulla fornitura dei loro servizi, secondo le modalita' e i termini di cui agli articoli 30, 31 e 32. 2. Le notifiche includono le...

- skeptic (approved/high): The mapping aligns well with Art. 25 of D.Lgs. 138/2024, which explicitly outlines the obligation for essential and important entities to notify CSIRT Italia of significant incidents without undue delay, specifically within 72 hours. This directly supports the control regarding the timely reporting of security incidents to the relevant authority.
- advocate (approved/high): The mapping to the control regarding the notification of security incidents within 72 hours is strongly supported by Article 25 of D.Lgs. 138/2024. This article explicitly mandates that essential and important entities must notify CSIRT Italia of significant incidents without undue delay, specifically stating that such notifications must occur within 72 hours of becoming aware of the incident. This aligns directly with the control's requirement for timely reporting to the relevant authority, thus providing a robust justification for the mapping.
- auditor (approved/high): The citation from D.Lgs. 138/2024, Art. 25 directly addresses the requirements for incident notification, including the timeframe for reporting significant incidents to the CSIRT Italia. Specifically, it mandates that significant incidents must be notified without undue delay and within 72 hours of becoming aware of the incident, which aligns with the control's requirement for reporting security incidents to the authority within 72 hours. Therefore, this regulatory section genuinely supports the control mapping for 'Security incidents reported to authority within 72 hours.'

### 7. ctrl_cloudtrail_enabled · D.Lgs. 138/2024, Art. 24

- Queue ID: `d1365817-fd44-4d83-9180-f819ef93b04f`
- Mapping ID: `ade44031-b294-400c-a68c-0834053846dc`
- Status: `needs_human`
- Regulator: ACN - Agenzia per la Cybersicurezza Nazionale
- Similarity: 0.176
- Stage 2: skeptic: too_broad/medium (gpt-4o-mini); advocate: approved/high (gpt-4o-mini); auditor: approved/high (gpt-4o)
- Stage 3: overrides: similarity_below_threshold
- Source: it/dlgs-138-2024.html · https://www.gazzettaufficiale.it/eli/id/2024/10/01/24G00155/SG
- Source excerpt: Art. 24 Obblighi in materia di misure di gestione dei rischi per la sicurezza informatica 1. I soggetti essenziali e i soggetti importanti adottano misure tecniche, operative e organizzative adeguate e proporzionate, secondo le modalita' e i termini di cui agli articoli 30, 31 e 32, alla gestione dei rischi posti alla sicurezza dei sistemi informativi e di...

- skeptic (too_broad/medium): Article 24 outlines general obligations for risk management measures in cybersecurity but does not specifically mandate the implementation of audit logging mechanisms like CloudTrail. While it emphasizes the need for adequate security measures and incident management, it does not directly support the specific control mapping regarding the logging of administrative and security events in a cloud account.
- advocate (approved/high): Article 24 of D.Lgs. 138/2024 outlines obligations regarding risk management measures for cybersecurity, emphasizing the need for technical and operational measures to ensure adequate security levels. The requirement for logging administrative and security events in a protected storage aligns with the directive's focus on incident management and risk mitigation. Specifically, the article mandates that essential and important entities adopt measures that ensure the security of their information systems, which includes maintaining audit logs as part of effective incident management and risk assessment practices.
- auditor (approved/high): Article 24 of D.Lgs. 138/2024 outlines obligations for essential and important entities to adopt adequate and proportionate technical, operational, and organizational measures for cybersecurity risk management. This includes ensuring an adequate level of security for information systems and networks, which aligns with the control's requirement for audit logging to track administrative and security events. The article specifically mentions the need for risk analysis, incident management, and security policies, which are relevant to enabling audit logging like CloudTrail. Therefore, this regulatory section supports the control mapping for enabling audit logging in cloud environments.

### 8. ctrl_guest_access_controlled · D.Lgs. 138/2024, Art. 24

- Queue ID: `bd191653-ee02-4dab-a74c-e72404a0c772`
- Mapping ID: `3b131de3-f2e8-4114-b70e-f6a17a7b70f1`
- Status: `needs_human`
- Regulator: ACN - Agenzia per la Cybersicurezza Nazionale
- Similarity: 0.206
- Stage 2: skeptic: too_broad/medium (gpt-4o-mini); advocate: approved/high (gpt-4o-mini); auditor: approved/high (gpt-4o)
- Stage 3: overrides: similarity_below_threshold
- Source: it/dlgs-138-2024.html · https://www.gazzettaufficiale.it/eli/id/2024/10/01/24G00155/SG
- Source excerpt: Art. 24 Obblighi in materia di misure di gestione dei rischi per la sicurezza informatica 1. I soggetti essenziali e i soggetti importanti adottano misure tecniche, operative e organizzative adeguate e proporzionate, secondo le modalita' e i termini di cui agli articoli 30, 31 e 32, alla gestione dei rischi posti alla sicurezza dei sistemi informativi e di...

- skeptic (too_broad/medium): Article 24 outlines general obligations for essential and important entities regarding risk management measures for cybersecurity. While it emphasizes the need for adequate security measures and incident management, it does not specifically address the identification and revocation of inactive guest accounts. The control described is a specific aspect of access control that may fall under the broader requirements of security measures, but the article does not explicitly support this specific control mapping.
- advocate (approved/high): Article 24 of D.Lgs. 138/2024 outlines obligations regarding risk management measures for cybersecurity, emphasizing the need for technical, operational, and organizational measures that are adequate and proportionate to the risks faced. The control regarding the identification and revocation of inactive guest accounts aligns with the requirement for access control policies and procedures mentioned in the article. Specifically, it supports the notion of ensuring security and reliability of personnel and access control, which is a critical aspect of managing cybersecurity risks effectively.
- auditor (approved/high): Article 24 of D.Lgs. 138/2024 outlines obligations for essential and important entities to adopt adequate and proportionate technical, operational, and organizational measures for managing cybersecurity risks. This includes ensuring an adequate level of security for information and network systems, which inherently involves controlling access to these systems. The control in question, 'Guest and external user access is controlled,' aligns with the requirement to implement access control policies as part of broader cybersecurity risk management measures. Specifically, Article 24, paragraph 2, item i mentions 'politiche di controllo dell'accesso,' which directly supports the control's focus on managing access, including revoking inactive guest accounts.

### 9. ctrl_backup_tested · D.Lgs. 138/2024, Art. 24

- Queue ID: `726d4378-957a-4aa6-b1af-38f95f1f33ed`
- Mapping ID: `eba27255-f752-4df8-a689-93ae023f5b20`
- Status: `needs_human`
- Regulator: ACN - Agenzia per la Cybersicurezza Nazionale
- Similarity: 0.208
- Stage 2: skeptic: too_broad/medium (gpt-4o-mini); advocate: approved/high (gpt-4o-mini); auditor: approved/high (gpt-4o)
- Stage 3: overrides: similarity_below_threshold
- Source: it/dlgs-138-2024.html · https://www.gazzettaufficiale.it/eli/id/2024/10/01/24G00155/SG
- Source excerpt: Art. 24 Obblighi in materia di misure di gestione dei rischi per la sicurezza informatica 1. I soggetti essenziali e i soggetti importanti adottano misure tecniche, operative e organizzative adeguate e proporzionate, secondo le modalita' e i termini di cui agli articoli 30, 31 e 32, alla gestione dei rischi posti alla sicurezza dei sistemi informativi e di...

- skeptic (too_broad/medium): The mapping refers to backups being tested regularly, which is a specific aspect of operational continuity. However, Article 24 discusses broader obligations regarding risk management measures for cybersecurity without explicitly detailing the frequency or testing of backups. The control may fall under the general requirement for operational continuity, but the article does not specifically mandate regular testing of backups, making the mapping too broad.
- advocate (approved/high): Article 24 of D.Lgs. 138/2024 outlines obligations for essential and important entities regarding cybersecurity risk management measures. It explicitly mentions the need for operational continuity, which includes backup management and disaster recovery. The control mapping for regular testing of backups aligns with the requirements set forth in this article, as it emphasizes the importance of ensuring the effectiveness of backup measures as part of a comprehensive risk management strategy.
- auditor (approved/high): The citation from D.Lgs. 138/2024, Art. 24, specifically addresses the obligations related to cybersecurity risk management measures, including the management of backups and disaster recovery as part of ensuring operational continuity (Art. 24, 2(c)). This directly supports the control 'Backups are tested regularly' as it emphasizes the need for adequate and proportionate measures for managing risks to information systems and networks, which includes backup management and restoration in case of disasters. Therefore, the regulatory section genuinely supports the control mapping.

### 10. ctrl_password_policy · D.Lgs. 138/2024, Art. 24

- Queue ID: `56a4de3b-82ad-4cb2-a70e-84dd967296f0`
- Mapping ID: `83dca63d-e21b-4e3a-9367-c3888840c394`
- Status: `needs_human`
- Regulator: ACN - Agenzia per la Cybersicurezza Nazionale
- Similarity: 0.239
- Stage 2: skeptic: too_broad/medium (gpt-4o-mini); advocate: approved/high (gpt-4o-mini); auditor: approved/medium (gpt-4o)
- Stage 3: overrides: similarity_below_threshold
- Source: it/dlgs-138-2024.html · https://www.gazzettaufficiale.it/eli/id/2024/10/01/24G00155/SG
- Source excerpt: Art. 24 Obblighi in materia di misure di gestione dei rischi per la sicurezza informatica 1. I soggetti essenziali e i soggetti importanti adottano misure tecniche, operative e organizzative adeguate e proporzionate, secondo le modalita' e i termini di cui agli articoli 30, 31 e 32, alla gestione dei rischi posti alla sicurezza dei sistemi informativi e di...

- skeptic (too_broad/medium): Article 24 outlines general obligations for essential and important entities regarding cybersecurity risk management measures. While it emphasizes the need for adequate technical, operational, and organizational measures, it does not specifically mandate a password and account lockout policy. The control described is a specific implementation detail that may fall under the broader category of security measures but is not explicitly supported by the article's text. Therefore, the mapping is too broad and lacks direct alignment with the specific requirements of the article.
- advocate (approved/high): Article 24 of D.Lgs. 138/2024 outlines the obligations for essential and important entities to adopt adequate and proportionate technical, operational, and organizational measures for cybersecurity risk management. The control mapping for a password and account lockout policy aligns with the requirement to ensure a level of security appropriate to existing risks, which includes implementing measures such as account lockout after unsuccessful attempts. This is directly related to the management of risks to information systems and networks, thus supporting the control mapping effectively.
- auditor (approved/medium): Article 24 of D.Lgs. 138/2024 outlines obligations for essential and important entities to adopt adequate and proportionate technical, operational, and organizational measures for cybersecurity risk management. The article emphasizes the need for policies related to risk analysis, security of information systems and networks, and access control, which are relevant to the control of configuring password and account lockout policies. The requirement for 'politiche di controllo dell'accesso' (access control policies) directly supports the control's focus on password policies and account lockout mechanisms. However, the article does not explicitly mention password policies, which slightly reduces the confidence level.

### 11. ctrl_privileged_access_reviewed · D.Lgs. 138/2024, Art. 24

- Queue ID: `b98d09f7-8902-49bc-97aa-b27c12774d38`
- Mapping ID: `7540e25b-d165-4be7-8dbe-edded44b82a2`
- Status: `needs_human`
- Regulator: ACN - Agenzia per la Cybersicurezza Nazionale
- Similarity: 0.247
- Stage 2: skeptic: too_broad/medium (gpt-4o-mini); advocate: approved/high (gpt-4o-mini); auditor: approved/high (gpt-4o)
- Stage 3: overrides: similarity_below_threshold
- Source: it/dlgs-138-2024.html · https://www.gazzettaufficiale.it/eli/id/2024/10/01/24G00155/SG
- Source excerpt: Art. 24 Obblighi in materia di misure di gestione dei rischi per la sicurezza informatica 1. I soggetti essenziali e i soggetti importanti adottano misure tecniche, operative e organizzative adeguate e proporzionate, secondo le modalita' e i termini di cui agli articoli 30, 31 e 32, alla gestione dei rischi posti alla sicurezza dei sistemi informativi e di...

- skeptic (too_broad/medium): Article 24 outlines general obligations for essential and important entities to adopt adequate and proportionate risk management measures for cybersecurity. While it emphasizes the need for security measures, it does not specifically mandate the periodic review of privileged user access. The control described is a specific implementation detail that may fall under the broader requirement for security measures, but the article itself does not explicitly support this control mapping, making it too broad for a direct correlation.
- advocate (approved/high): Article 24 of D.Lgs. 138/2024 outlines obligations for essential and important entities to adopt adequate and proportionate technical, operational, and organizational measures for cybersecurity risk management. This includes ensuring a level of security appropriate to existing risks, which encompasses policies and procedures related to access control and the management of privileged accounts. The control mapping for periodic review of privileged user access aligns with the requirement to implement effective access control measures as part of a comprehensive risk management strategy, thereby supporting the mapping.
- auditor (approved/high): The source text from D.Lgs. 138/2024, Art. 24 outlines obligations for essential and important entities to adopt adequate and proportionate technical, operational, and organizational measures for cybersecurity risk management. Specifically, it mentions policies and procedures for evaluating the effectiveness of cybersecurity risk management measures (Art. 24, 2f) and access control policies (Art. 24, 2i). These elements align with the control's requirement for periodic review of privileged user access, as such reviews are part of evaluating the effectiveness of access control measures and ensuring they remain adequate and proportionate to the risks. Therefore, this regulatory section supports the control mapping for periodic review of privileged user access.

### 12. ctrl_security_event_alerting · D.Lgs. 138/2024, Art. 24

- Queue ID: `a6ebb608-67be-424b-ae81-91626ccdda95`
- Mapping ID: `50726763-2097-4624-8040-4ac38d96fa74`
- Status: `needs_human`
- Regulator: ACN - Agenzia per la Cybersicurezza Nazionale
- Similarity: 0.276
- Stage 2: skeptic: too_broad/medium (gpt-4o-mini); advocate: approved/high (gpt-4o-mini); auditor: approved/high (gpt-4o)
- Stage 3: overrides: similarity_below_threshold
- Source: it/dlgs-138-2024.html · https://www.gazzettaufficiale.it/eli/id/2024/10/01/24G00155/SG
- Source excerpt: Art. 24 Obblighi in materia di misure di gestione dei rischi per la sicurezza informatica 1. I soggetti essenziali e i soggetti importanti adottano misure tecniche, operative e organizzative adeguate e proporzionate, secondo le modalita' e i termini di cui agli articoli 30, 31 e 32, alla gestione dei rischi posti alla sicurezza dei sistemi informativi e di...

- skeptic (too_broad/medium): Article 24 outlines general obligations for essential and important entities regarding cybersecurity risk management measures. While it emphasizes the need for adequate security measures and incident management, it does not specifically mention the generation of alerts for security events as described in the control. The control may be implied within the broader context of incident management, but the article does not explicitly support this specific control mapping, making it too broad to be directly linked.
- advocate (approved/high): Article 24 of D.Lgs. 138/2024 outlines the obligations for essential and important entities regarding cybersecurity risk management measures. It emphasizes the need for adequate technical, operational, and organizational measures to manage risks to information systems and networks. The control mapping for 'Security events generate alerts' aligns with the requirement for incident management and the implementation of measures that ensure a sufficient level of security, which includes alerting responsible teams about suspicious activities. This directly supports the control's intent to enhance cybersecurity posture through proactive monitoring and incident reporting, fulfilling the auditor's expectations.
- auditor (approved/high): The citation from D.Lgs. 138/2024, Art. 24, specifically addresses the obligations related to cybersecurity risk management measures. It outlines the need for essential and important entities to adopt technical, operational, and organizational measures to manage risks to the security of information and network systems. This includes ensuring an adequate level of security and implementing risk analysis and security policies. The control in question, 'Security events generate alerts,' aligns with these requirements as it pertains to the detection and alerting of security events, which is a fundamental aspect of managing cybersecurity risks. The article's emphasis on risk management and incident handling supports the control's focus on generating alerts for security events, making the citation relevant and supportive of the control mapping.

### 13. ctrl_conditional_access · D.Lgs. 138/2024, Art. 24

- Queue ID: `c6c45ec4-c821-4a8d-9b0d-2eca301f97f7`
- Mapping ID: `66e9e04c-da97-4662-be32-c462f9e88491`
- Status: `needs_human`
- Regulator: ACN - Agenzia per la Cybersicurezza Nazionale
- Similarity: 0.281
- Stage 2: skeptic: too_broad/medium (gpt-4o-mini); advocate: approved/high (gpt-4o-mini); auditor: approved/high (gpt-4o)
- Stage 3: overrides: similarity_below_threshold
- Source: it/dlgs-138-2024.html · https://www.gazzettaufficiale.it/eli/id/2024/10/01/24G00155/SG
- Source excerpt: Art. 24 Obblighi in materia di misure di gestione dei rischi per la sicurezza informatica 1. I soggetti essenziali e i soggetti importanti adottano misure tecniche, operative e organizzative adeguate e proporzionate, secondo le modalita' e i termini di cui agli articoli 30, 31 e 32, alla gestione dei rischi posti alla sicurezza dei sistemi informativi e di...

- skeptic (too_broad/medium): Article 24 outlines general obligations for essential and important entities regarding risk management measures for cybersecurity. While it mentions the need for adequate security measures, including multi-risk approaches and the use of multi-factor authentication, it does not specifically mandate conditional access for risky sign-ins. The control mapping is too broad as it interprets the general requirement as a specific enforcement action without clear support from the text.
- advocate (approved/high): Article 24 of D.Lgs. 138/2024 outlines obligations for essential and important entities to adopt adequate and proportionate technical, operational, and organizational measures for cybersecurity risk management. Specifically, it emphasizes the importance of ensuring a security level appropriate to existing risks and mentions the use of multi-risk approaches, which include policies for risk analysis and security of information systems. The reference to 'uso di soluzioni di autenticazione a piu' fattori' (use of multi-factor authentication solutions) directly supports the control mapping for enforcing conditional access for risky sign-ins, as it aligns with the requirement to implement measures that enhance security in response to identified risks. This connection provides a strong justification for accepting the mapping.
- auditor (approved/high): The citation from D.Lgs. 138/2024, Art. 24, specifically addresses the obligations of essential and important entities to adopt adequate and proportionate technical, operational, and organizational measures for managing cybersecurity risks. The control in question, 'Conditional access is enforced for risky sign-ins,' aligns with the general requirement for implementing security measures that ensure an adequate level of security for information systems and networks, as mentioned in Art. 24(1)(a). Additionally, the mention of 'politiche di controllo dell'accesso' in Art. 24(2)(i) directly supports the need for access control policies, which would encompass conditional access measures for risky sign-ins. Therefore, this regulatory section genuinely supports the control mapping.

### 14. ctrl_logging_monitoring · D.Lgs. 138/2024, Art. 24

- Queue ID: `85af9683-fe34-4ac6-8e35-9a83c1e1e05b`
- Mapping ID: `34cfcd1a-68b8-49e3-8035-a777e95d480c`
- Status: `needs_human`
- Regulator: ACN - Agenzia per la Cybersicurezza Nazionale
- Similarity: 0.263
- Stage 2: skeptic: too_broad/medium (gpt-4o-mini); advocate: approved/high (gpt-4o-mini); auditor: too_broad/high (gpt-4o)
- Stage 3: passed/no overrides
- Source: it/dlgs-138-2024.html · https://www.gazzettaufficiale.it/eli/id/2024/10/01/24G00155/SG
- Source excerpt: Art. 24 Obblighi in materia di misure di gestione dei rischi per la sicurezza informatica 1. I soggetti essenziali e i soggetti importanti adottano misure tecniche, operative e organizzative adeguate e proporzionate, secondo le modalita' e i termini di cui agli articoli 30, 31 e 32, alla gestione dei rischi posti alla sicurezza dei sistemi informativi e di...

- skeptic (too_broad/medium): Article 24 outlines broad obligations for essential and important entities regarding risk management measures for cybersecurity. While it emphasizes the need for adequate security measures, it does not specifically mandate the centralization of security logs or audit logs as described in the control. The control is too specific compared to the general requirements stated in the article, which could lead to misinterpretation of compliance expectations.
- advocate (approved/high): Article 24 of D.Lgs. 138/2024 outlines obligations for essential and important entities to adopt adequate and proportionate technical, operational, and organizational measures for cybersecurity risk management. The requirement for centralized security logs aligns with the need to ensure a level of security appropriate to existing risks, as stated in paragraph 1(a). Additionally, the measures must include incident management procedures, which would inherently involve the collection and centralization of security logs for effective monitoring and response, as indicated in paragraph 2(b). Therefore, the control mapping to centralized security logs is well-supported by the regulatory text.
- auditor (too_broad/high): The cited article, D.Lgs. 138/2024, Art. 24, outlines general obligations for cybersecurity risk management measures, including technical, operational, and organizational measures. However, it does not specifically address the centralization of security logs or the management of audit logs in a controlled access environment. The article is broad and covers various aspects of cybersecurity risk management, but it lacks specific provisions related to the control of centralizing security logs. Therefore, while it supports the general theme of cybersecurity measures, it does not directly support the specific control mapping for centralized security logs.
