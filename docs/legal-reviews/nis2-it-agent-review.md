# NIS2 IT Agent Review Package

Generated: 2026-05-05T14:51:31.110Z

Purpose: Stage 2 and Stage 3 agent review has already run. This package is for a human reviewer to make the final mapping decision. It does not promote any row.

Source rule: official-source verification is separate. The reviewer should answer only whether the cited section genuinely supports the mapped control.

Allowed human decisions:

- `approved`: mapping correctly supports the control; promote.
- `wrong_article`: citation points to the wrong section; reject and re-research.
- `too_broad`: related but does not directly support this control; reject.
- `needs_research`: reviewer cannot decide; defer.

## Summary

- Total rows: 34
- status needs_human: 34

Agent decision buckets:

- approved / high: 12
- approved / medium: 16
- too_broad / medium: 6

Stage 3 overrides:

- domain_blacklist: 7
- similarity_below_threshold: 27

## Sources

- it/dlgs-138-2024.html: 34 rows · D.Lgs. 138/2024 - Recepimento direttiva NIS2 · https://www.gazzettaufficiale.it/eli/id/2024/10/01/24G00155/SG

## Review Rows

| Queue ID | Mapping ID | Control | Category | Citation | Similarity | Agent | Stage 3 | Human decision | Human note |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 92ebbf5d-9e64-4a84-bed9-7ca522996695 | 00fadc2d-a7ff-41f9-ab84-9317229adbc8 | ctrl_mfa_all_users - MFA enabled for all user accounts | access_control | D.Lgs. 138/2024, Art. 24 | 0.189 | approved / high | overrides: similarity_below_threshold |  |  |
| df9a0cad-bc31-4d15-8af8-0ce2fcbc603a | a626c9a4-9beb-45bf-a455-4de4fbda7c41 | ctrl_root_account_mfa - Root or break-glass accounts have MFA | access_control | D.Lgs. 138/2024, Art. 24 | 0.233 | approved / high | overrides: similarity_below_threshold |  |  |
| 5c9619db-f8c5-4f2a-8680-835392627f6c | 62b4a956-57a7-4682-b701-5001c7b3f97c | ctrl_security_training_annual - All staff complete annual security awareness training | training | D.Lgs. 138/2024, Art. 24 | 0.267 | approved / high | overrides: similarity_below_threshold |  |  |
| c227ffb3-a818-4012-bac4-1b56286b6874 | a20c7b89-6ec2-4725-ac1e-11ac6cf47132 | ctrl_cryptography_policy - Cryptography policy is approved | data_protection | D.Lgs. 138/2024, Art. 24 | 0.271 | approved / high | overrides: similarity_below_threshold, domain_blacklist; blacklist: nis2_cryptography |  |  |
| dd078c4d-f838-42e3-9e1f-95bbf70db0d0 | 7170944b-d0fb-47ba-8082-d9c76c5b989c | ctrl_business_continuity_plan - Business continuity plan is documented | business_continuity | D.Lgs. 138/2024, Art. 24 | 0.285 | approved / high | overrides: similarity_below_threshold |  |  |
| 791133f7-2b56-47c0-9f87-464b0e54ddb3 | b2070eb6-1d4d-4151-bc0d-c025c94de46f | ctrl_incident_plan_documented - Incident response plan is documented and reviewed annually | incident | D.Lgs. 138/2024, Art. 24 | 0.289 | approved / high | overrides: similarity_below_threshold, domain_blacklist; blacklist: nis2_incident_response_or_regulatory_deadline |  |  |
| 262fa734-84d4-41a6-98af-7e9d65b1c077 | 623f6386-d10b-41f4-a3bb-145fd1a2408d | ctrl_dependency_vulnerability_monitoring - Dependency vulnerabilities are monitored | asset_management | D.Lgs. 138/2024, Art. 24 | 0.292 | approved / high | overrides: similarity_below_threshold |  |  |
| 95b782c8-5437-41b5-9ce7-066f68dfbe83 | ac2a2404-6a3b-48a8-ab10-a277b2746407 | ctrl_disaster_recovery_test - Disaster recovery is tested regularly | business_continuity | D.Lgs. 138/2024, Art. 24 | 0.293 | approved / high | overrides: similarity_below_threshold |  |  |
| e525218a-0d3a-49ed-81c0-ee5b803c10c7 | 562360ab-3bc4-4e8e-aa98-617bb3ebe4ff | ctrl_vulnerability_management - Vulnerabilities are tracked and remediated | asset_management | D.Lgs. 138/2024, Art. 24 | 0.326 | approved / high | overrides: similarity_below_threshold |  |  |
| abb588cc-7e4e-4986-a337-8f5191fe4505 | a7f6f6d4-f94a-49e9-a2e8-2e74afe26afa | ctrl_supplier_contract_security - Supplier contracts include security requirements | supplier | D.Lgs. 138/2024, Art. 24 | 0.367 | approved / high | overrides: similarity_below_threshold |  |  |
| 5973a224-2ba3-4cc2-b8ba-2ae2fb8acc61 | fca7dc29-6d5c-4729-890b-4c78b08a7068 | ctrl_vendor_security_assessment - Vendors are assessed for security risk | supplier | D.Lgs. 138/2024, Art. 24 | 0.382 | approved / high | overrides: similarity_below_threshold |  |  |
| 899bb005-4cbf-4456-84b2-202b582ec8f8 | c56b161d-1303-4a53-bca8-71b982369edc | ctrl_incident_72h_notification - Security incidents reported to authority within 72 hours | incident | D.Lgs. 138/2024, Art. 25 | 0.431 | approved / high | overrides: domain_blacklist; blacklist: nis2_incident_response_or_regulatory_deadline |  |  |
| d1365817-fd44-4d83-9180-f819ef93b04f | ade44031-b294-400c-a68c-0834053846dc | ctrl_cloudtrail_enabled - CloudTrail or equivalent audit logging is enabled | incident | D.Lgs. 138/2024, Art. 24 | 0.176 | approved / medium | overrides: similarity_below_threshold |  |  |
| bd191653-ee02-4dab-a74c-e72404a0c772 | 3b131de3-f2e8-4114-b70e-f6a17a7b70f1 | ctrl_guest_access_controlled - Guest and external user access is controlled | access_control | D.Lgs. 138/2024, Art. 24 | 0.206 | approved / medium | overrides: similarity_below_threshold |  |  |
| 726d4378-957a-4aa6-b1af-38f95f1f33ed | eba27255-f752-4df8-a689-93ae023f5b20 | ctrl_backup_tested - Backups are tested regularly | business_continuity | D.Lgs. 138/2024, Art. 24 | 0.208 | approved / medium | overrides: similarity_below_threshold |  |  |
| e0104e23-4971-470c-8e9a-8684bdea2a02 | 64eefc11-f3ea-494c-9b21-35c1e1277bfa | ctrl_s3_encryption - Object storage buckets encrypt data | data_protection | D.Lgs. 138/2024, Art. 24 | 0.226 | approved / medium | overrides: similarity_below_threshold, domain_blacklist; blacklist: nis2_cryptography |  |  |
| dae90470-f30a-401e-8faa-1d18d8e7c75e | 34ded221-afe4-4af2-804f-5cf921ba6588 | ctrl_device_encryption - Company devices use full-disk encryption | data_protection | D.Lgs. 138/2024, Art. 24 | 0.235 | approved / medium | overrides: similarity_below_threshold, domain_blacklist; blacklist: nis2_cryptography |  |  |
| 56a4de3b-82ad-4cb2-a70e-84dd967296f0 | 83dca63d-e21b-4e3a-9367-c3888840c394 | ctrl_password_policy - Password and account lockout policy is configured | access_control | D.Lgs. 138/2024, Art. 24 | 0.239 | approved / medium | overrides: similarity_below_threshold |  |  |
| b98d09f7-8902-49bc-97aa-b27c12774d38 | 7540e25b-d165-4be7-8dbe-edded44b82a2 | ctrl_privileged_access_reviewed - Privileged user access is periodically reviewed | access_control | D.Lgs. 138/2024, Art. 24 | 0.247 | approved / medium | overrides: similarity_below_threshold |  |  |
| 106f75d8-b0f6-4c54-92d4-c840b93ca684 | 4dfe7ddc-34a8-4cda-b1a7-2b3cb9cd2037 | ctrl_physical_access_control - Physical access to offices is controlled | physical | D.Lgs. 138/2024, Art. 24 | 0.256 | approved / medium | overrides: similarity_below_threshold |  |  |
| e6f8dfc0-af9e-4613-92f2-966d8e9cb222 | a4712282-c9e4-4986-892b-339ba3057ae7 | ctrl_data_encrypted_at_rest - Sensitive data is encrypted at rest | data_protection | D.Lgs. 138/2024, Art. 24 | 0.260 | approved / medium | overrides: similarity_below_threshold, domain_blacklist; blacklist: nis2_cryptography |  |  |
| 1f12f9c5-51e2-4c5a-ad90-4d80a8418ad6 | c57b7057-3100-4b29-9e71-046097e6d969 | ctrl_endpoint_protection - Endpoint protection is active on managed devices | asset_management | D.Lgs. 138/2024, Art. 24 | 0.269 | approved / medium | overrides: similarity_below_threshold |  |  |
| 061a302a-37c2-406c-ac08-7058bb80fee5 | 083779c6-83a1-4708-b134-54f0f5061a06 | ctrl_patch_management - Security patching is managed and tracked | asset_management | D.Lgs. 138/2024, Art. 24 | 0.276 | approved / medium | overrides: similarity_below_threshold |  |  |
| a6ebb608-67be-424b-ae81-91626ccdda95 | 50726763-2097-4624-8040-4ac38d96fa74 | ctrl_security_event_alerting - Security events generate alerts | incident | D.Lgs. 138/2024, Art. 24 | 0.276 | approved / medium | overrides: similarity_below_threshold |  |  |
| c6c45ec4-c821-4a8d-9b0d-2eca301f97f7 | 66e9e04c-da97-4662-be32-c462f9e88491 | ctrl_conditional_access - Conditional access is enforced for risky sign-ins | access_control | D.Lgs. 138/2024, Art. 24 | 0.281 | approved / medium | overrides: similarity_below_threshold |  |  |
| 5ee43a55-884c-4e3a-b039-7f5216fafb01 | 120539cd-f5e5-41a8-924b-2a9d45428bf1 | ctrl_penetration_test_annual - Penetration testing is performed at least annually | asset_management | D.Lgs. 138/2024, Art. 24 | 0.325 | approved / medium | overrides: similarity_below_threshold |  |  |
| 1992bd69-7239-437f-8423-6867de223b55 | 9334456a-3c55-4db8-8e4b-3bce4567dc0e | ctrl_secure_configuration_baseline - Secure configuration baselines are defined | asset_management | D.Lgs. 138/2024, Art. 24 | 0.339 | approved / medium | overrides: similarity_below_threshold |  |  |
| 79c2a5f8-762d-4c27-b8d3-39df308c28a3 | 5ee74133-0ce8-4c58-bc15-46bcd5bba925 | ctrl_network_segmentation - Network is segmented by criticality | asset_management | D.Lgs. 138/2024, Art. 24 | 0.351 | approved / medium | overrides: similarity_below_threshold |  |  |
| ce539bc5-8270-4ed8-90e9-a8681fff60f6 | 419ca4dd-5a63-4a7e-b09e-1954a9d3d850 | ctrl_code_review_required - Code changes require peer review | asset_management | D.Lgs. 138/2024, Art. 24 | 0.197 | too_broad / medium | passed/no overrides |  |  |
| 7e2c916a-198e-42fa-ad9e-69de1acd18e2 | 63413c21-2a84-40f2-888e-7001f3773307 | ctrl_secrets_management - Secrets and keys are not stored in source code | data_protection | D.Lgs. 138/2024, Art. 24 | 0.200 | too_broad / medium | overrides: domain_blacklist; blacklist: nis2_cryptography |  |  |
| 1511a4b4-8f26-4dee-a7f8-6deca6eb9d63 | a2001ab4-d7e9-4b6f-95cf-7ee0fdd2105e | ctrl_change_management - Production changes are controlled | asset_management | D.Lgs. 138/2024, Art. 24 | 0.201 | too_broad / medium | passed/no overrides |  |  |
| b050f536-ff6d-4b63-91b5-f0372f791b90 | a5f0ad1d-e093-4fba-b4e9-e632779859d4 | ctrl_branch_protection_enabled - Production branches are protected | asset_management | D.Lgs. 138/2024, Art. 24 | 0.208 | too_broad / medium | passed/no overrides |  |  |
| 91e9f93d-629c-4929-80be-6dc86cb18c85 | 1487a1c6-5e1a-40e8-9bd9-31e8aa8eff58 | ctrl_asset_inventory - Asset inventory is complete and current | asset_management | D.Lgs. 138/2024, Art. 24 | 0.232 | too_broad / medium | passed/no overrides |  |  |
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

### 3. ctrl_security_training_annual · D.Lgs. 138/2024, Art. 24

- Queue ID: `5c9619db-f8c5-4f2a-8680-835392627f6c`
- Mapping ID: `62b4a956-57a7-4682-b701-5001c7b3f97c`
- Status: `needs_human`
- Regulator: ACN - Agenzia per la Cybersicurezza Nazionale
- Similarity: 0.267
- Stage 2: skeptic: approved/high (gpt-4o-mini); advocate: approved/high (gpt-4o-mini); auditor: approved/high (gpt-4o)
- Stage 3: overrides: similarity_below_threshold
- Source: it/dlgs-138-2024.html · https://www.gazzettaufficiale.it/eli/id/2024/10/01/24G00155/SG
- Source excerpt: Art. 24 Obblighi in materia di misure di gestione dei rischi per la sicurezza informatica 1. I soggetti essenziali e i soggetti importanti adottano misure tecniche, operative e organizzative adeguate e proporzionate, secondo le modalita' e i termini di cui agli articoli 30, 31 e 32, alla gestione dei rischi posti alla sicurezza dei sistemi informativi e di...

- skeptic (approved/high): Article 24 of D.Lgs. 138/2024 outlines obligations for essential and important entities to adopt adequate and proportionate measures for cybersecurity risk management, which includes basic hygiene practices and security training. The control mapping for annual security awareness training aligns well with the requirements stated in the article, particularly in section 2, letter g), which explicitly mentions training in cybersecurity as part of the necessary measures.
- advocate (approved/high): Article 24 of D.Lgs. 138/2024 outlines obligations regarding risk management measures for cybersecurity, which include the necessity for training in cybersecurity practices. Specifically, it mentions 'g) pratiche di igiene di base e di formazione in materia di sicurezza informatica', indicating that basic hygiene practices and training in cybersecurity are essential components of the risk management measures. This directly supports the control mapping for annual security awareness training for all staff, as it emphasizes the importance of ongoing education and awareness in mitigating cybersecurity risks.
- auditor (approved/high): Article 24 of D.Lgs. 138/2024 outlines obligations related to cybersecurity risk management measures, including the implementation of security policies and procedures. Specifically, section 2(g) mentions 'pratiche di igiene di base e di formazione in materia di sicurezza informatica,' which translates to basic hygiene practices and training in cybersecurity. This directly supports the control requirement for annual security awareness training for all staff, as it emphasizes the importance of training as part of cybersecurity risk management measures. Therefore, this citation is relevant and supports the control mapping.

### 4. ctrl_cryptography_policy · D.Lgs. 138/2024, Art. 24

- Queue ID: `c227ffb3-a818-4012-bac4-1b56286b6874`
- Mapping ID: `a20c7b89-6ec2-4725-ac1e-11ac6cf47132`
- Status: `needs_human`
- Regulator: ACN - Agenzia per la Cybersicurezza Nazionale
- Similarity: 0.271
- Stage 2: skeptic: approved/high (gpt-4o-mini); advocate: approved/high (gpt-4o-mini); auditor: approved/high (gpt-4o)
- Stage 3: overrides: similarity_below_threshold, domain_blacklist; blacklist: nis2_cryptography
- Source: it/dlgs-138-2024.html · https://www.gazzettaufficiale.it/eli/id/2024/10/01/24G00155/SG
- Source excerpt: Art. 24 Obblighi in materia di misure di gestione dei rischi per la sicurezza informatica 1. I soggetti essenziali e i soggetti importanti adottano misure tecniche, operative e organizzative adeguate e proporzionate, secondo le modalita' e i termini di cui agli articoli 30, 31 e 32, alla gestione dei rischi posti alla sicurezza dei sistemi informativi e di...

- skeptic (approved/high): Article 24 of D.Lgs. 138/2024 explicitly mentions the need for policies and procedures related to the use of cryptography, which aligns directly with the control mapping for a cryptography policy. The article outlines that organizations must adopt adequate measures for cybersecurity risk management, including the use of cryptography as a part of their security measures.
- advocate (approved/high): Article 24 of D.Lgs. 138/2024 explicitly mentions the need for policies and procedures related to the use of cryptography, which directly supports the control mapping for a cryptography policy. The article outlines that organizations must adopt adequate measures for cybersecurity risk management, including the use of cryptography as a part of their security measures. This aligns with the control description that specifies the definition of requirements for encryption, key management, certificate rotation, and usage.
- auditor (approved/high): The source text from D.Lgs. 138/2024, Art. 24 explicitly mentions 'politiche e procedure relative all'uso della crittografia e, ove opportuno, della cifratura' under section 2(h). This directly aligns with the control's focus on defining requirements for encryption, key management, rotation, and certificate usage. The article outlines obligations for cybersecurity risk management measures, including cryptography policies, which supports the control mapping for a cryptography policy being approved.

### 5. ctrl_business_continuity_plan · D.Lgs. 138/2024, Art. 24

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

### 6. ctrl_incident_plan_documented · D.Lgs. 138/2024, Art. 24

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

### 7. ctrl_dependency_vulnerability_monitoring · D.Lgs. 138/2024, Art. 24

- Queue ID: `262fa734-84d4-41a6-98af-7e9d65b1c077`
- Mapping ID: `623f6386-d10b-41f4-a3bb-145fd1a2408d`
- Status: `needs_human`
- Regulator: ACN - Agenzia per la Cybersicurezza Nazionale
- Similarity: 0.292
- Stage 2: skeptic: approved/high (gpt-4o-mini); advocate: approved/high (gpt-4o-mini); auditor: approved/high (gpt-4o)
- Stage 3: overrides: similarity_below_threshold
- Source: it/dlgs-138-2024.html · https://www.gazzettaufficiale.it/eli/id/2024/10/01/24G00155/SG
- Source excerpt: Art. 24 Obblighi in materia di misure di gestione dei rischi per la sicurezza informatica 1. I soggetti essenziali e i soggetti importanti adottano misure tecniche, operative e organizzative adeguate e proporzionate, secondo le modalita' e i termini di cui agli articoli 30, 31 e 32, alla gestione dei rischi posti alla sicurezza dei sistemi informativi e di...

- skeptic (approved/high): Article 24 of D.Lgs. 138/2024 outlines obligations for essential and important entities to adopt adequate and proportionate risk management measures for cybersecurity. It specifically mentions the need for monitoring vulnerabilities and ensuring security in the supply chain, which aligns with the control description of monitoring dependency vulnerabilities. The article supports the control mapping as it emphasizes the importance of addressing vulnerabilities in a structured manner.
- advocate (approved/high): Article 24 of D.Lgs. 138/2024 outlines obligations for essential and important entities to adopt adequate and proportionate technical, operational, and organizational measures for cybersecurity risk management. Specifically, it emphasizes the importance of monitoring vulnerabilities, including those related to supply chain security and the management and disclosure of vulnerabilities. This aligns directly with the control mapping for monitoring dependency vulnerabilities, as it supports the need for ownership and remediation timelines for critical findings, thus justifying the acceptance of this mapping.
- auditor (approved/high): The citation from D.Lgs. 138/2024, Art. 24, specifically addresses the obligations of essential and important entities to adopt adequate and proportionate technical, operational, and organizational measures for managing cybersecurity risks. This includes the management and disclosure of vulnerabilities, as outlined in Art. 24, 2(e). The control in question, 'Dependency vulnerabilities are monitored,' aligns with the requirement to manage and disclose vulnerabilities, as it involves tracking security alerts in dependencies and ensuring critical findings have an owner and a remediation timeline. Therefore, this regulatory section genuinely supports the control mapping.

### 8. ctrl_disaster_recovery_test · D.Lgs. 138/2024, Art. 24

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

### 9. ctrl_vulnerability_management · D.Lgs. 138/2024, Art. 24

- Queue ID: `e525218a-0d3a-49ed-81c0-ee5b803c10c7`
- Mapping ID: `562360ab-3bc4-4e8e-aa98-617bb3ebe4ff`
- Status: `needs_human`
- Regulator: ACN - Agenzia per la Cybersicurezza Nazionale
- Similarity: 0.326
- Stage 2: skeptic: approved/high (gpt-4o-mini); advocate: approved/high (gpt-4o-mini); auditor: approved/high (gpt-4o)
- Stage 3: overrides: similarity_below_threshold
- Source: it/dlgs-138-2024.html · https://www.gazzettaufficiale.it/eli/id/2024/10/01/24G00155/SG
- Source excerpt: Art. 24 Obblighi in materia di misure di gestione dei rischi per la sicurezza informatica 1. I soggetti essenziali e i soggetti importanti adottano misure tecniche, operative e organizzative adeguate e proporzionate, secondo le modalita' e i termini di cui agli articoli 30, 31 e 32, alla gestione dei rischi posti alla sicurezza dei sistemi informativi e di...

- skeptic (approved/high): Article 24 outlines obligations for essential and important entities regarding risk management measures for cybersecurity. It emphasizes the need for adequate and proportionate technical, operational, and organizational measures to manage risks, which includes the identification and remediation of vulnerabilities. The control mapping aligns with the requirement to track and remediate vulnerabilities as part of a broader risk management strategy.
- advocate (approved/high): Article 24 of D.Lgs. 138/2024 outlines obligations for essential and important entities to adopt adequate and proportionate measures for managing cybersecurity risks. It specifically mentions the need for policies and procedures related to the management and disclosure of vulnerabilities, which directly supports the control mapping for tracking and remediating vulnerabilities. The emphasis on prioritizing vulnerabilities based on severity aligns with the requirements for effective risk management and incident reporting as outlined in the NIS2 Directive.
- auditor (approved/high): The citation from D.Lgs. 138/2024, Art. 24, specifically addresses the management of cybersecurity risks, including the management and disclosure of vulnerabilities (Art. 24, 2, e). This aligns well with the control requirement that vulnerabilities from internal and external sources are prioritized and remediated. The article outlines the need for adequate technical, operational, and organizational measures to manage risks, which includes vulnerability management. Therefore, this regulatory section genuinely supports the control mapping for vulnerability management.

### 10. ctrl_supplier_contract_security · D.Lgs. 138/2024, Art. 24

- Queue ID: `abb588cc-7e4e-4986-a337-8f5191fe4505`
- Mapping ID: `a7f6f6d4-f94a-49e9-a2e8-2e74afe26afa`
- Status: `needs_human`
- Regulator: ACN - Agenzia per la Cybersicurezza Nazionale
- Similarity: 0.367
- Stage 2: skeptic: approved/high (gpt-4o-mini); advocate: approved/high (gpt-4o-mini); auditor: approved/high (gpt-4o)
- Stage 3: overrides: similarity_below_threshold
- Source: it/dlgs-138-2024.html · https://www.gazzettaufficiale.it/eli/id/2024/10/01/24G00155/SG
- Source excerpt: Art. 24 Obblighi in materia di misure di gestione dei rischi per la sicurezza informatica 1. I soggetti essenziali e i soggetti importanti adottano misure tecniche, operative e organizzative adeguate e proporzionate, secondo le modalita' e i termini di cui agli articoli 30, 31 e 32, alla gestione dei rischi posti alla sicurezza dei sistemi informativi e di...

- skeptic (approved/high): Article 24 of D.Lgs. 138/2024 outlines obligations regarding risk management measures for cybersecurity, including the necessity for essential and important entities to adopt appropriate security measures. It specifically mentions the importance of supply chain security and the need to consider vulnerabilities related to direct suppliers, which aligns with the control mapping regarding supplier contracts that include security requirements. Therefore, the mapping is supported by the regulatory section.
- advocate (approved/high): Article 24 of D.Lgs. 138/2024 outlines obligations for essential and important entities regarding cybersecurity risk management measures. It specifically mentions the need for security in supply chain management, including the relationships with direct suppliers and service providers. This aligns directly with the control mapping that requires supplier contracts to include security requirements, as it emphasizes the importance of managing risks associated with suppliers and ensuring their cybersecurity practices are adequate. The reference to security measures in the context of supplier relationships supports the justification for this control mapping.
- auditor (approved/high): Article 24 of D.Lgs. 138/2024 outlines obligations related to cybersecurity risk management measures, including the security of supply chains. Specifically, it addresses the security aspects of relationships between entities and their direct suppliers or service providers (Art. 24, 2(d)). This directly supports the control requirement that supplier contracts include security requirements, as it mandates consideration of security in supplier relationships. Therefore, this citation genuinely supports the control mapping regarding supplier contract security requirements.

### 11. ctrl_vendor_security_assessment · D.Lgs. 138/2024, Art. 24

- Queue ID: `5973a224-2ba3-4cc2-b8ba-2ae2fb8acc61`
- Mapping ID: `fca7dc29-6d5c-4729-890b-4c78b08a7068`
- Status: `needs_human`
- Regulator: ACN - Agenzia per la Cybersicurezza Nazionale
- Similarity: 0.382
- Stage 2: skeptic: approved/high (gpt-4o-mini); advocate: approved/high (gpt-4o-mini); auditor: approved/high (gpt-4o)
- Stage 3: overrides: similarity_below_threshold
- Source: it/dlgs-138-2024.html · https://www.gazzettaufficiale.it/eli/id/2024/10/01/24G00155/SG
- Source excerpt: Art. 24 Obblighi in materia di misure di gestione dei rischi per la sicurezza informatica 1. I soggetti essenziali e i soggetti importanti adottano misure tecniche, operative e organizzative adeguate e proporzionate, secondo le modalita' e i termini di cui agli articoli 30, 31 e 32, alla gestione dei rischi posti alla sicurezza dei sistemi informativi e di...

- skeptic (approved/high): Article 24 of D.Lgs. 138/2024 explicitly addresses the security of supply chains and the assessment of risks related to direct suppliers and service providers. It mandates that essential and important entities adopt adequate measures to manage risks, including evaluating the security practices of their vendors. This aligns well with the control mapping for assessing vendors for security risk, as it emphasizes the importance of evaluating suppliers based on their security capabilities and vulnerabilities.
- advocate (approved/high): Article 24 of D.Lgs. 138/2024 explicitly mandates that essential and important entities must adopt adequate and proportionate technical, operational, and organizational measures for managing cybersecurity risks. This includes assessing the security of their supply chain and direct suppliers, which aligns directly with the control mapping that states 'Vendors are assessed for security risk.' The text emphasizes the importance of evaluating the security practices of suppliers and the overall quality of their cybersecurity measures, thereby providing a strong justification for the acceptance of this control mapping.
- auditor (approved/high): The cited article, D.Lgs. 138/2024, Art. 24, specifically addresses the obligations related to cybersecurity risk management measures, including the security of the supply chain. Paragraph 2(d) explicitly mentions the security aspects concerning the relationships between entities and their direct suppliers or service providers. Furthermore, paragraph 3 emphasizes the need to consider specific vulnerabilities of each direct supplier and the overall quality of their cybersecurity practices. This directly supports the control 'Vendors are assessed for security risk,' as it mandates the evaluation of suppliers' security measures, aligning with the requirement to assess critical vendors before procurement and regularly based on service risk.

### 12. ctrl_incident_72h_notification · D.Lgs. 138/2024, Art. 25

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

### 13. ctrl_cloudtrail_enabled · D.Lgs. 138/2024, Art. 24

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

### 14. ctrl_guest_access_controlled · D.Lgs. 138/2024, Art. 24

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

### 15. ctrl_backup_tested · D.Lgs. 138/2024, Art. 24

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

### 16. ctrl_s3_encryption · D.Lgs. 138/2024, Art. 24

- Queue ID: `e0104e23-4971-470c-8e9a-8684bdea2a02`
- Mapping ID: `64eefc11-f3ea-494c-9b21-35c1e1277bfa`
- Status: `needs_human`
- Regulator: ACN - Agenzia per la Cybersicurezza Nazionale
- Similarity: 0.226
- Stage 2: skeptic: too_broad/medium (gpt-4o-mini); advocate: approved/high (gpt-4o-mini); auditor: approved/high (gpt-4o)
- Stage 3: overrides: similarity_below_threshold, domain_blacklist; blacklist: nis2_cryptography
- Source: it/dlgs-138-2024.html · https://www.gazzettaufficiale.it/eli/id/2024/10/01/24G00155/SG
- Source excerpt: Art. 24 Obblighi in materia di misure di gestione dei rischi per la sicurezza informatica 1. I soggetti essenziali e i soggetti importanti adottano misure tecniche, operative e organizzative adeguate e proporzionate, secondo le modalita' e i termini di cui agli articoli 30, 31 e 32, alla gestione dei rischi posti alla sicurezza dei sistemi informativi e di...

- skeptic (too_broad/medium): Article 24 outlines general obligations for essential and important entities to adopt adequate and proportionate risk management measures for cybersecurity. While it mentions the use of encryption and policies related to it, the control mapping specifically refers to object storage buckets requiring enforced encryption and blocked public access. The article does not explicitly mandate these specific technical measures, making the mapping too broad and not directly supported by the text.
- advocate (approved/high): Article 24 of D.Lgs. 138/2024 outlines obligations for essential and important entities to adopt adequate and proportionate technical, operational, and organizational measures for cybersecurity risk management. Specifically, it includes the use of encryption as part of the security measures (point 2, letter h), which directly supports the control mapping for enforcing encryption in object storage buckets. This aligns with the requirements for ensuring a level of security appropriate to existing risks, thereby justifying the acceptance of this mapping.
- auditor (approved/high): The citation from D.Lgs. 138/2024, Art. 24, specifically addresses the obligations for essential and important entities to adopt adequate and proportionate technical, operational, and organizational measures for cybersecurity risk management. This includes the use of encryption as part of the security measures, as indicated in section 2(h), which mentions policies and procedures related to the use of encryption and, where appropriate, encryption. This directly supports the control requirement for object storage buckets to encrypt data, as encryption is a fundamental aspect of securing data storage and preventing unauthorized access. Therefore, the citation genuinely supports the control mapping for ensuring that object storage buckets encrypt data.

### 17. ctrl_device_encryption · D.Lgs. 138/2024, Art. 24

- Queue ID: `dae90470-f30a-401e-8faa-1d18d8e7c75e`
- Mapping ID: `34ded221-afe4-4af2-804f-5cf921ba6588`
- Status: `needs_human`
- Regulator: ACN - Agenzia per la Cybersicurezza Nazionale
- Similarity: 0.235
- Stage 2: skeptic: too_broad/medium (gpt-4o-mini); advocate: approved/high (gpt-4o-mini); auditor: approved/high (gpt-4o)
- Stage 3: overrides: similarity_below_threshold, domain_blacklist; blacklist: nis2_cryptography
- Source: it/dlgs-138-2024.html · https://www.gazzettaufficiale.it/eli/id/2024/10/01/24G00155/SG
- Source excerpt: Art. 24 Obblighi in materia di misure di gestione dei rischi per la sicurezza informatica 1. I soggetti essenziali e i soggetti importanti adottano misure tecniche, operative e organizzative adeguate e proporzionate, secondo le modalita' e i termini di cui agli articoli 30, 31 e 32, alla gestione dei rischi posti alla sicurezza dei sistemi informativi e di...

- skeptic (too_broad/medium): Article 24 outlines general obligations for risk management measures related to cybersecurity, emphasizing the need for technical, operational, and organizational measures. While it mentions the use of encryption policies (point 2, letter h), it does not specifically mandate full-disk encryption for company devices. The control mapping is therefore too broad, as it assumes a specific implementation (full-disk encryption) that is not explicitly required by the article.
- advocate (approved/high): Article 24 of D.Lgs. 138/2024 outlines obligations for essential and important entities to adopt adequate and proportionate technical, operational, and organizational measures for cybersecurity risk management. Specifically, it includes provisions for the use of encryption as part of the security measures to protect information systems and networks. The control mapping for full-disk encryption on company devices aligns with the directive's emphasis on implementing appropriate security measures to mitigate risks, thereby supporting the justification for this mapping.
- auditor (approved/high): Article 24 of D.Lgs. 138/2024 outlines obligations for essential and important entities to adopt adequate and proportionate technical, operational, and organizational measures for cybersecurity risk management. Specifically, it mentions the use of encryption policies and procedures under section 2(h), which directly supports the control requiring company devices to use full-disk encryption. This alignment with encryption practices as part of risk management measures makes the citation relevant and supportive of the control mapping.

### 18. ctrl_password_policy · D.Lgs. 138/2024, Art. 24

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

### 19. ctrl_privileged_access_reviewed · D.Lgs. 138/2024, Art. 24

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

### 20. ctrl_physical_access_control · D.Lgs. 138/2024, Art. 24

- Queue ID: `106f75d8-b0f6-4c54-92d4-c840b93ca684`
- Mapping ID: `4dfe7ddc-34a8-4cda-b1a7-2b3cb9cd2037`
- Status: `needs_human`
- Regulator: ACN - Agenzia per la Cybersicurezza Nazionale
- Similarity: 0.256
- Stage 2: skeptic: too_broad/medium (gpt-4o-mini); advocate: approved/high (gpt-4o-mini); auditor: approved/high (gpt-4o)
- Stage 3: overrides: similarity_below_threshold
- Source: it/dlgs-138-2024.html · https://www.gazzettaufficiale.it/eli/id/2024/10/01/24G00155/SG
- Source excerpt: Art. 24 Obblighi in materia di misure di gestione dei rischi per la sicurezza informatica 1. I soggetti essenziali e i soggetti importanti adottano misure tecniche, operative e organizzative adeguate e proporzionate, secondo le modalita' e i termini di cui agli articoli 30, 31 e 32, alla gestione dei rischi posti alla sicurezza dei sistemi informativi e di...

- skeptic (too_broad/medium): While Article 24 outlines obligations for risk management measures in cybersecurity, it does not specifically address physical access control to offices or server rooms. The control description focuses on restricting access to authorized personnel and regular reviews, which is a specific aspect of physical security not explicitly mentioned in the article. The article's scope is broader, encompassing various technical, operational, and organizational measures without detailing physical access controls.
- advocate (approved/high): Article 24 of D.Lgs. 138/2024 outlines obligations regarding risk management measures for cybersecurity, emphasizing the importance of technical, operational, and organizational measures. The control mapping for physical access to offices aligns with the requirement for access control policies and procedures as part of the broader risk management framework. Specifically, the mention of 'politiche di controllo dell'accesso' (access control policies) directly supports the implementation of restricted access to sensitive areas, which is a critical aspect of cybersecurity risk management.
- auditor (approved/high): Article 24 of D.Lgs. 138/2024 outlines obligations for essential and important entities to adopt adequate and proportionate technical, operational, and organizational measures for cybersecurity risk management. Specifically, it mentions the need for policies and procedures related to access control (Art. 24, 2(i)), which directly supports the control mapping regarding physical access restrictions to offices, server rooms, and equipment storage. The requirement for access control policies aligns with the control's focus on limiting access to authorized personnel and regular reviews, thus supporting the control mapping effectively.

### 21. ctrl_data_encrypted_at_rest · D.Lgs. 138/2024, Art. 24

- Queue ID: `e6f8dfc0-af9e-4613-92f2-966d8e9cb222`
- Mapping ID: `a4712282-c9e4-4986-892b-339ba3057ae7`
- Status: `needs_human`
- Regulator: ACN - Agenzia per la Cybersicurezza Nazionale
- Similarity: 0.260
- Stage 2: skeptic: too_broad/medium (gpt-4o-mini); advocate: approved/high (gpt-4o-mini); auditor: approved/high (gpt-4o)
- Stage 3: overrides: similarity_below_threshold, domain_blacklist; blacklist: nis2_cryptography
- Source: it/dlgs-138-2024.html · https://www.gazzettaufficiale.it/eli/id/2024/10/01/24G00155/SG
- Source excerpt: Art. 24 Obblighi in materia di misure di gestione dei rischi per la sicurezza informatica 1. I soggetti essenziali e i soggetti importanti adottano misure tecniche, operative e organizzative adeguate e proporzionate, secondo le modalita' e i termini di cui agli articoli 30, 31 e 32, alla gestione dei rischi posti alla sicurezza dei sistemi informativi e di...

- skeptic (too_broad/medium): Article 24 outlines general obligations for risk management measures in cybersecurity, including the use of encryption as part of a broader set of security measures. However, it does not specifically mandate encryption of sensitive data at rest, making the control mapping too broad in its interpretation of the article's requirements.
- advocate (approved/high): Article 24 of D.Lgs. 138/2024 outlines obligations regarding risk management measures for cybersecurity, emphasizing the need for adequate technical and organizational measures. Specifically, it mentions the use of encryption policies (point 2, letter h) as part of the cybersecurity measures. This directly supports the control mapping for encrypting sensitive data at rest, as it aligns with the requirement to implement encryption as a security measure to protect information systems and networks.
- auditor (approved/high): Article 24 of D.Lgs. 138/2024 outlines obligations related to cybersecurity risk management measures, which include policies and procedures for the use of encryption and, where appropriate, encryption itself (as stated in point h). This directly supports the control that requires sensitive data to be encrypted at rest, as encryption is a key measure for protecting data in storage. The article's focus on ensuring adequate security measures, including encryption, aligns well with the control's objective of protecting sensitive data through encryption.

### 22. ctrl_endpoint_protection · D.Lgs. 138/2024, Art. 24

- Queue ID: `1f12f9c5-51e2-4c5a-ad90-4d80a8418ad6`
- Mapping ID: `c57b7057-3100-4b29-9e71-046097e6d969`
- Status: `needs_human`
- Regulator: ACN - Agenzia per la Cybersicurezza Nazionale
- Similarity: 0.269
- Stage 2: skeptic: too_broad/medium (gpt-4o-mini); advocate: approved/high (gpt-4o-mini); auditor: approved/high (gpt-4o)
- Stage 3: overrides: similarity_below_threshold
- Source: it/dlgs-138-2024.html · https://www.gazzettaufficiale.it/eli/id/2024/10/01/24G00155/SG
- Source excerpt: Art. 24 Obblighi in materia di misure di gestione dei rischi per la sicurezza informatica 1. I soggetti essenziali e i soggetti importanti adottano misure tecniche, operative e organizzative adeguate e proporzionate, secondo le modalita' e i termini di cui agli articoli 30, 31 e 32, alla gestione dei rischi posti alla sicurezza dei sistemi informativi e di...

- skeptic (too_broad/medium): Article 24 outlines general obligations for essential and important entities to adopt adequate and proportionate technical, operational, and organizational measures for cybersecurity risk management. While it emphasizes the need for security measures, it does not specifically mandate the use of EDR or antivirus solutions with active monitoring and automatic updates. The control mapping is too broad as it interprets the general requirement as a specific implementation without direct support from the text.
- advocate (approved/high): Article 24 of D.Lgs. 138/2024 outlines the obligations for essential and important entities to adopt adequate and proportionate technical, operational, and organizational measures for cybersecurity risk management. The control mapping for 'Endpoint protection is active on managed devices' aligns with the requirement to ensure an appropriate level of security for information systems and networks, as stated in paragraph 1(a). The use of EDR or antivirus with active monitoring and automatic updates directly supports the implementation of technical measures to mitigate cybersecurity risks, fulfilling the directive's expectations for proactive security management.
- auditor (approved/high): The citation from D.Lgs. 138/2024, Art. 24, specifically addresses the obligations of essential and important entities to adopt adequate and proportionate technical, operational, and organizational measures for managing cybersecurity risks. This includes ensuring the security of information and network systems, which aligns with the control requirement for endpoint protection on managed devices. The article emphasizes the need for measures that are up-to-date with current knowledge and standards, which supports the use of EDR or antivirus solutions with active monitoring and automatic updates as part of a comprehensive cybersecurity risk management strategy. Therefore, this regulatory section genuinely supports the control mapping for endpoint protection.

### 23. ctrl_patch_management · D.Lgs. 138/2024, Art. 24

- Queue ID: `061a302a-37c2-406c-ac08-7058bb80fee5`
- Mapping ID: `083779c6-83a1-4708-b134-54f0f5061a06`
- Status: `needs_human`
- Regulator: ACN - Agenzia per la Cybersicurezza Nazionale
- Similarity: 0.276
- Stage 2: skeptic: too_broad/medium (gpt-4o-mini); advocate: approved/high (gpt-4o-mini); auditor: approved/high (gpt-4o)
- Stage 3: overrides: similarity_below_threshold
- Source: it/dlgs-138-2024.html · https://www.gazzettaufficiale.it/eli/id/2024/10/01/24G00155/SG
- Source excerpt: Art. 24 Obblighi in materia di misure di gestione dei rischi per la sicurezza informatica 1. I soggetti essenziali e i soggetti importanti adottano misure tecniche, operative e organizzative adeguate e proporzionate, secondo le modalita' e i termini di cui agli articoli 30, 31 e 32, alla gestione dei rischi posti alla sicurezza dei sistemi informativi e di...

- skeptic (too_broad/medium): The regulatory section (D.Lgs. 138/2024, Art. 24) outlines general obligations for essential and important entities to adopt adequate and proportionate measures for cybersecurity risk management. While it emphasizes the need for technical, operational, and organizational measures, it does not specifically mention the management and tracking of security patching as a distinct control. The control described ('Security patching is managed and tracked') is a specific implementation detail that may fall under the broader requirements but is not explicitly supported by the text. Therefore, the mapping is too broad and lacks direct alignment with the specific control.
- advocate (approved/high): Article 24 of D.Lgs. 138/2024 outlines the obligations for essential and important entities regarding cybersecurity risk management measures. It emphasizes the adoption of adequate technical, operational, and organizational measures to manage risks to the security of information and network systems. The control regarding security patching aligns with the requirement to ensure an appropriate level of security for information systems, which includes timely updates to operating systems and applications to mitigate vulnerabilities. This directly supports the control mapping for managing and tracking security patching as part of a comprehensive risk management strategy.
- auditor (approved/high): Article 24 of D.Lgs. 138/2024 outlines obligations for essential and important entities to adopt adequate and proportionate technical, operational, and organizational measures for managing cybersecurity risks. Specifically, section 2(e) mentions the security of acquisition, development, and maintenance of information systems and networks, including the management and disclosure of vulnerabilities. This directly supports the control regarding the management and tracking of security patching, as it involves maintaining systems through timely updates and vulnerability management. Therefore, this citation genuinely supports the control mapping related to security patching.

### 24. ctrl_security_event_alerting · D.Lgs. 138/2024, Art. 24

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

### 25. ctrl_conditional_access · D.Lgs. 138/2024, Art. 24

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

### 26. ctrl_penetration_test_annual · D.Lgs. 138/2024, Art. 24

- Queue ID: `5ee43a55-884c-4e3a-b039-7f5216fafb01`
- Mapping ID: `120539cd-f5e5-41a8-924b-2a9d45428bf1`
- Status: `needs_human`
- Regulator: ACN - Agenzia per la Cybersicurezza Nazionale
- Similarity: 0.325
- Stage 2: skeptic: too_broad/medium (gpt-4o-mini); advocate: approved/high (gpt-4o-mini); auditor: approved/high (gpt-4o)
- Stage 3: overrides: similarity_below_threshold
- Source: it/dlgs-138-2024.html · https://www.gazzettaufficiale.it/eli/id/2024/10/01/24G00155/SG
- Source excerpt: Art. 24 Obblighi in materia di misure di gestione dei rischi per la sicurezza informatica 1. I soggetti essenziali e i soggetti importanti adottano misure tecniche, operative e organizzative adeguate e proporzionate, secondo le modalita' e i termini di cui agli articoli 30, 31 e 32, alla gestione dei rischi posti alla sicurezza dei sistemi informativi e di...

- skeptic (too_broad/medium): The control mapping for annual penetration testing is not explicitly supported by Art. 24 of D.Lgs. 138/2024. While the article outlines the need for adequate risk management measures and mentions security assessments, it does not specifically mandate annual penetration testing. The language used is broad and focuses on general security measures without detailing specific testing requirements, which makes the mapping too broad and not directly aligned with the control description.
- advocate (approved/high): Article 24 of D.Lgs. 138/2024 outlines the obligations for essential and important entities regarding cybersecurity risk management measures. It emphasizes the need for adequate and proportionate technical, operational, and organizational measures to manage risks to information systems and networks. The control of conducting penetration testing at least annually aligns with the requirement to ensure a level of security appropriate to existing risks, as stated in paragraph 1(a). Furthermore, the article mentions the importance of evaluating the effectiveness of risk management measures, which supports the necessity of regular testing to identify and address vulnerabilities. Therefore, the mapping of this control to the regulatory section is justified and defensible.
- auditor (approved/high): The citation from D.Lgs. 138/2024, Art. 24, specifically addresses the obligations regarding cybersecurity risk management measures, which include ensuring an adequate level of security for information systems and networks. The article outlines the need for technical, operational, and organizational measures that are proportionate to the risks, which aligns with the control's requirement for regular penetration testing. Penetration testing is a recognized method to assess and ensure the security of systems, fitting within the broader context of risk management and security measures described in Art. 24. Therefore, this regulatory section genuinely supports the control mapping for annual penetration testing.

### 27. ctrl_secure_configuration_baseline · D.Lgs. 138/2024, Art. 24

- Queue ID: `1992bd69-7239-437f-8423-6867de223b55`
- Mapping ID: `9334456a-3c55-4db8-8e4b-3bce4567dc0e`
- Status: `needs_human`
- Regulator: ACN - Agenzia per la Cybersicurezza Nazionale
- Similarity: 0.339
- Stage 2: skeptic: too_broad/medium (gpt-4o-mini); advocate: approved/high (gpt-4o-mini); auditor: approved/high (gpt-4o)
- Stage 3: overrides: similarity_below_threshold
- Source: it/dlgs-138-2024.html · https://www.gazzettaufficiale.it/eli/id/2024/10/01/24G00155/SG
- Source excerpt: Art. 24 Obblighi in materia di misure di gestione dei rischi per la sicurezza informatica 1. I soggetti essenziali e i soggetti importanti adottano misure tecniche, operative e organizzative adeguate e proporzionate, secondo le modalita' e i termini di cui agli articoli 30, 31 e 32, alla gestione dei rischi posti alla sicurezza dei sistemi informativi e di...

- skeptic (too_broad/medium): The mapping to the control 'Secure configuration baselines are defined' is too broad because Article 24 primarily outlines general obligations for risk management measures in cybersecurity without specifically detailing the requirements for secure configuration baselines. While it mentions the need for adequate security measures, it does not explicitly state that secure configuration baselines must be defined for cloud accounts, identities, endpoints, and production systems. Therefore, the mapping lacks specificity and may not fully align with the intent of the regulatory text.
- advocate (approved/high): Article 24 of D.Lgs. 138/2024 outlines obligations for essential and important entities to adopt adequate and proportionate technical, operational, and organizational measures for cybersecurity risk management. It emphasizes the need for a security level appropriate to existing risks and mentions the importance of secure configurations as part of the risk management measures. The control mapping for 'Secure configuration baselines are defined' aligns with the requirement to ensure a baseline security level for information systems, thereby supporting the control mapping effectively.
- auditor (approved/high): Article 24 of D.Lgs. 138/2024 outlines obligations for essential and important entities to adopt adequate and proportionate technical, operational, and organizational measures for managing cybersecurity risks. The article emphasizes the need for a multi-risk approach to protect information systems and networks, which includes policies for risk analysis and security, incident management, and security of system acquisition, development, and maintenance. These elements align with the control's requirement for secure configuration baselines, as they imply the establishment of minimum security settings for systems, including cloud accounts, identities, endpoints, and production systems. Therefore, the citation genuinely supports the control mapping for defining secure configuration baselines.

### 28. ctrl_network_segmentation · D.Lgs. 138/2024, Art. 24

- Queue ID: `79c2a5f8-762d-4c27-b8d3-39df308c28a3`
- Mapping ID: `5ee74133-0ce8-4c58-bc15-46bcd5bba925`
- Status: `needs_human`
- Regulator: ACN - Agenzia per la Cybersicurezza Nazionale
- Similarity: 0.351
- Stage 2: skeptic: too_broad/medium (gpt-4o-mini); advocate: approved/high (gpt-4o-mini); auditor: approved/medium (gpt-4o)
- Stage 3: overrides: similarity_below_threshold
- Source: it/dlgs-138-2024.html · https://www.gazzettaufficiale.it/eli/id/2024/10/01/24G00155/SG
- Source excerpt: Art. 24 Obblighi in materia di misure di gestione dei rischi per la sicurezza informatica 1. I soggetti essenziali e i soggetti importanti adottano misure tecniche, operative e organizzative adeguate e proporzionate, secondo le modalita' e i termini di cui agli articoli 30, 31 e 32, alla gestione dei rischi posti alla sicurezza dei sistemi informativi e di...

- skeptic (too_broad/medium): The control description regarding network segmentation is not explicitly addressed in Art. 24 of D.Lgs. 138/2024. While the article discusses the adoption of adequate and proportionate technical, operational, and organizational measures for cybersecurity risk management, it does not specifically mandate network segmentation or detail how access controls should be managed. The language used is broad and focuses on overall risk management rather than specific controls like network segmentation, which makes the mapping too broad to be considered a direct support for this control.
- advocate (approved/high): Article 24 of D.Lgs. 138/2024 outlines obligations regarding risk management measures for cybersecurity, emphasizing the need for technical, operational, and organizational measures that are adequate and proportionate to the risks faced. The control mapping for network segmentation aligns with the directive's requirement to ensure a level of security appropriate to existing risks, which includes segmenting networks based on criticality to minimize the impact of incidents. This is supported by the directive's focus on protecting information systems and networks, thereby justifying the acceptance of this mapping.
- auditor (approved/medium): Article 24 of D.Lgs. 138/2024 outlines obligations for essential and important entities to adopt adequate and proportionate technical, operational, and organizational measures for managing cybersecurity risks. The article emphasizes the need for a multi-risk approach to protect information systems and networks, which includes policies for risk analysis, incident management, and access control. The control in question, 'Network is segmented by criticality,' aligns with these requirements as network segmentation is a recognized method for managing cybersecurity risks by controlling access and protecting critical segments of the network. While the article does not explicitly mention network segmentation, the general principles of risk management and access control support the control's objectives. Therefore, this citation can be considered supportive of the control mapping, albeit with medium confidence due to the lack of explicit mention of network segmentation.

### 29. ctrl_code_review_required · D.Lgs. 138/2024, Art. 24

- Queue ID: `ce539bc5-8270-4ed8-90e9-a8681fff60f6`
- Mapping ID: `419ca4dd-5a63-4a7e-b09e-1954a9d3d850`
- Status: `needs_human`
- Regulator: ACN - Agenzia per la Cybersicurezza Nazionale
- Similarity: 0.197
- Stage 2: skeptic: too_broad/medium (gpt-4o-mini); advocate: approved/high (gpt-4o-mini); auditor: too_broad/high (gpt-4o)
- Stage 3: passed/no overrides
- Source: it/dlgs-138-2024.html · https://www.gazzettaufficiale.it/eli/id/2024/10/01/24G00155/SG
- Source excerpt: Art. 24 Obblighi in materia di misure di gestione dei rischi per la sicurezza informatica 1. I soggetti essenziali e i soggetti importanti adottano misure tecniche, operative e organizzative adeguate e proporzionate, secondo le modalita' e i termini di cui agli articoli 30, 31 e 32, alla gestione dei rischi posti alla sicurezza dei sistemi informativi e di...

- skeptic (too_broad/medium): Article 24 outlines general obligations for risk management measures in cybersecurity, emphasizing the need for technical, operational, and organizational measures. While it mentions the importance of security in information systems and networks, it does not specifically address code review processes or peer review requirements for code changes. The control mapping is too broad as it interprets the article's general risk management obligations to imply specific practices like pull requests and peer reviews, which are not explicitly mentioned.
- advocate (approved/high): Article 24 of D.Lgs. 138/2024 outlines obligations for essential and important entities to adopt adequate and proportionate measures for cybersecurity risk management. It specifically mentions the need for security in the acquisition, development, and maintenance of information systems, which includes practices such as peer reviews and code changes requiring oversight. This aligns directly with the control mapping for requiring peer review of code changes, as it supports the implementation of security measures that ensure the integrity and security of systems, thereby fulfilling the requirements of the NIS2 Directive.
- auditor (too_broad/high): The citation D.Lgs. 138/2024, Art. 24 outlines general obligations for cybersecurity risk management measures, including security of information systems and networks, incident management, and supply chain security. However, it does not specifically address the requirement for code changes to undergo peer review, such as requiring pull requests, revisions, and successful checks before merging. The article is too broad and does not directly support the specific control mapping related to code review processes.

### 30. ctrl_secrets_management · D.Lgs. 138/2024, Art. 24

- Queue ID: `7e2c916a-198e-42fa-ad9e-69de1acd18e2`
- Mapping ID: `63413c21-2a84-40f2-888e-7001f3773307`
- Status: `needs_human`
- Regulator: ACN - Agenzia per la Cybersicurezza Nazionale
- Similarity: 0.200
- Stage 2: skeptic: too_broad/medium (gpt-4o-mini); advocate: approved/high (gpt-4o-mini); auditor: too_broad/high (gpt-4o)
- Stage 3: overrides: domain_blacklist; blacklist: nis2_cryptography
- Source: it/dlgs-138-2024.html · https://www.gazzettaufficiale.it/eli/id/2024/10/01/24G00155/SG
- Source excerpt: Art. 24 Obblighi in materia di misure di gestione dei rischi per la sicurezza informatica 1. I soggetti essenziali e i soggetti importanti adottano misure tecniche, operative e organizzative adeguate e proporzionate, secondo le modalita' e i termini di cui agli articoli 30, 31 e 32, alla gestione dei rischi posti alla sicurezza dei sistemi informativi e di...

- skeptic (too_broad/medium): Article 24 outlines general obligations for essential and important entities regarding cybersecurity risk management measures. While it emphasizes the need for adequate technical, operational, and organizational measures, it does not specifically mandate that secrets and keys must not be stored in source code. The control mapping is too broad as it interprets the article's requirements in a way that may not directly align with the specific control of secrets and keys management.
- advocate (approved/high): Article 24 of D.Lgs. 138/2024 outlines obligations for essential and important entities to adopt adequate and proportionate technical, operational, and organizational measures for cybersecurity risk management. The control mapping regarding secrets and keys not being stored in source code aligns with the requirement for ensuring a level of security appropriate to existing risks, which includes managing sensitive information securely. The emphasis on risk management and the necessity of implementing effective security measures supports the justification for this specific control mapping.
- auditor (too_broad/high): Art. 24 of D.Lgs. 138/2024 outlines general obligations for cybersecurity risk management measures, including technical, operational, and organizational measures. While it mentions the security of information systems and networks, it does not specifically address the control of ensuring secrets and keys are not stored in source code. The article provides a broad framework for risk management but lacks specific guidance on secrets management or the use of managed storage for production keys. Therefore, it is too broad to directly support the specific control mapping related to secrets and keys management.

### 31. ctrl_change_management · D.Lgs. 138/2024, Art. 24

- Queue ID: `1511a4b4-8f26-4dee-a7f8-6deca6eb9d63`
- Mapping ID: `a2001ab4-d7e9-4b6f-95cf-7ee0fdd2105e`
- Status: `needs_human`
- Regulator: ACN - Agenzia per la Cybersicurezza Nazionale
- Similarity: 0.201
- Stage 2: skeptic: too_broad/medium (gpt-4o-mini); advocate: approved/high (gpt-4o-mini); auditor: too_broad/high (gpt-4o)
- Stage 3: passed/no overrides
- Source: it/dlgs-138-2024.html · https://www.gazzettaufficiale.it/eli/id/2024/10/01/24G00155/SG
- Source excerpt: Art. 24 Obblighi in materia di misure di gestione dei rischi per la sicurezza informatica 1. I soggetti essenziali e i soggetti importanti adottano misure tecniche, operative e organizzative adeguate e proporzionate, secondo le modalita' e i termini di cui agli articoli 30, 31 e 32, alla gestione dei rischi posti alla sicurezza dei sistemi informativi e di...

- skeptic (too_broad/medium): The control description 'Production changes are controlled' is too broad and does not specifically align with the obligations outlined in Art. 24 of D.Lgs. 138/2024. While the article discusses risk management measures and incident reporting, it does not explicitly mention change management processes or the specific controls related to production changes. The focus of Art. 24 is on overall cybersecurity risk management rather than the specific control of production changes, which may lead to misinterpretation of compliance requirements.
- advocate (approved/high): Article 24 of D.Lgs. 138/2024 outlines obligations regarding risk management measures for cybersecurity, emphasizing the need for technical, operational, and organizational measures that are adequate and proportionate to the risks faced. The control mapping for 'Production changes are controlled' aligns with the requirement for managing risks associated with information systems and networks, as it implies a structured approach to change management, including ownership, approval, deployment planning, and rollback capabilities. This directly supports the intent of the article to ensure a secure operational environment and minimize incident impact.
- auditor (too_broad/high): The citation from D.Lgs. 138/2024, Art. 24, outlines general obligations for cybersecurity risk management measures, including technical, operational, and organizational measures. However, it does not specifically address the control of production changes, which involves ownership, approval, deployment planning, and rollback capabilities. The article is focused on broader risk management and incident response measures, rather than the specific processes and controls related to change management in production environments. Therefore, while it supports a general cybersecurity framework, it does not directly support the specific control mapping of 'Production changes are controlled.'

### 32. ctrl_branch_protection_enabled · D.Lgs. 138/2024, Art. 24

- Queue ID: `b050f536-ff6d-4b63-91b5-f0372f791b90`
- Mapping ID: `a5f0ad1d-e093-4fba-b4e9-e632779859d4`
- Status: `needs_human`
- Regulator: ACN - Agenzia per la Cybersicurezza Nazionale
- Similarity: 0.208
- Stage 2: skeptic: too_broad/medium (gpt-4o-mini); advocate: approved/high (gpt-4o-mini); auditor: too_broad/high (gpt-4o)
- Stage 3: passed/no overrides
- Source: it/dlgs-138-2024.html · https://www.gazzettaufficiale.it/eli/id/2024/10/01/24G00155/SG
- Source excerpt: Art. 24 Obblighi in materia di misure di gestione dei rischi per la sicurezza informatica 1. I soggetti essenziali e i soggetti importanti adottano misure tecniche, operative e organizzative adeguate e proporzionate, secondo le modalita' e i termini di cui agli articoli 30, 31 e 32, alla gestione dei rischi posti alla sicurezza dei sistemi informativi e di...

- skeptic (too_broad/medium): The control description regarding branch protection and approval processes is not explicitly addressed in Art. 24 of D.Lgs. 138/2024. While Art. 24 outlines general obligations for risk management measures in cybersecurity, it does not specifically mention the technical controls related to branch protection or direct push blocking. The mapping may be too broad as it interprets the general risk management requirements to imply specific technical controls without direct support from the cited article.
- advocate (approved/high): Article 24 of D.Lgs. 138/2024 outlines obligations for essential and important entities to adopt adequate and proportionate technical, operational, and organizational measures for cybersecurity risk management. The control mapping regarding 'Production branches are protected' aligns with the requirement for security measures to ensure an adequate level of security for information systems, which includes the implementation of policies that prevent unauthorized changes, such as direct pushes without review. This directly supports the control's focus on protecting production branches through approval processes, thereby fulfilling the directive's intent for risk management and incident prevention.
- auditor (too_broad/high): Art. 24 of D.Lgs. 138/2024 outlines general obligations for cybersecurity risk management measures, including technical, operational, and organizational measures to manage risks to information and network systems. While it mentions security measures related to system development and maintenance, it does not specifically address the control of protecting production branches by requiring approval, CI checks, and blocking direct pushes without review. The article is too broad and does not directly support the specific control of branch protection in software development environments.

### 33. ctrl_asset_inventory · D.Lgs. 138/2024, Art. 24

- Queue ID: `91e9f93d-629c-4929-80be-6dc86cb18c85`
- Mapping ID: `1487a1c6-5e1a-40e8-9bd9-31e8aa8eff58`
- Status: `needs_human`
- Regulator: ACN - Agenzia per la Cybersicurezza Nazionale
- Similarity: 0.232
- Stage 2: skeptic: too_broad/medium (gpt-4o-mini); advocate: approved/high (gpt-4o-mini); auditor: too_broad/medium (gpt-4o)
- Stage 3: passed/no overrides
- Source: it/dlgs-138-2024.html · https://www.gazzettaufficiale.it/eli/id/2024/10/01/24G00155/SG
- Source excerpt: Art. 24 Obblighi in materia di misure di gestione dei rischi per la sicurezza informatica 1. I soggetti essenziali e i soggetti importanti adottano misure tecniche, operative e organizzative adeguate e proporzionate, secondo le modalita' e i termini di cui agli articoli 30, 31 e 32, alla gestione dei rischi posti alla sicurezza dei sistemi informativi e di...

- skeptic (too_broad/medium): The mapping to the control 'Asset inventory is complete and current' based on Art. 24 of D.Lgs. 138/2024 is too broad. While the article discusses the need for adequate risk management measures, it does not specifically mandate the ownership, classification, or last revision date of hardware, software, cloud services, and data assets. The control requires more specific requirements than what is provided in the article, which focuses on general cybersecurity measures and incident management without detailing asset inventory requirements.
- advocate (approved/high): Article 24 of D.Lgs. 138/2024 outlines obligations for essential and important entities to adopt adequate and proportionate technical, operational, and organizational measures for managing cybersecurity risks. This includes ensuring that information systems and networks are secured according to existing risks and the latest knowledge, which directly supports the control mapping for maintaining a complete and current asset inventory. The requirement for ownership, classification, and review dates of hardware, software, cloud services, and data assets aligns with the broader risk management measures mandated in this article, thus providing a strong justification for the mapping.
- auditor (too_broad/medium): Art. 24 of D.Lgs. 138/2024 outlines general obligations for cybersecurity risk management measures, which include a wide range of technical, operational, and organizational measures. While it mentions the management of assets and systems, it does not specifically address the requirement for asset inventory to have an owner, classification, and last review date. The article is broad and covers various aspects of cybersecurity risk management, but it does not directly support the specific control of maintaining a complete and current asset inventory with detailed attributes as described in the control mapping.

### 34. ctrl_logging_monitoring · D.Lgs. 138/2024, Art. 24

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
