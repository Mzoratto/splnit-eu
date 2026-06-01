# New User Dashboard Response Playbook

Last updated: 2026-06-01

## Purpose

This is a study guide for answering a new Splnit.eu user who says something like:

> “I have just registered. I am in the dashboard page. What next?”

Use this as the founder/support answer template. It should help the user take the next useful action without overclaiming what Splnit.eu can prove today.

## Short answer to give the user

Welcome. The next step is to complete the intake. It takes about 15 minutes and tells Splnit.eu which NIS2/ZoKB, GDPR, ISO 27001, and other controls are relevant to your organization.

After the intake, you should:

1. Confirm the frameworks Splnit.eu recommends.
2. Review the priority gaps in Controls.
3. Connect one supported integration or open the relevant workspace.
4. Upload or import your first evidence.
5. Use the dashboard as a working evidence tracker, not as a legal certificate.

For a Czech SME preparing for NÚKIB-related expectations, the most useful first outcome is not a perfect score. The useful first outcome is a ranked list of gaps and at least one real evidence item attached to a control.

## The answer in conversational form

Use this when talking to a new user:

> Start with the intake button on the dashboard. The dashboard is only a starting point until Splnit.eu knows your company profile: country, sector, size, systems, data types, and which regulations likely apply.
>
> Once you finish the intake, Splnit.eu will show which controls are in scope, which ones need review, and which gaps look most important. Then choose one priority gap and attach the first piece of evidence, for example a policy, screenshot, export, access list, backup proof, or vendor document.
>
> If you use a supported system, connect that source or open the right workspace. For example, Microsoft 365, GitHub, AWS, Hetzner, OVHcloud, and ABRA Flexi have integration adapters. Helios is currently a guided manual workspace with Splnit CSV-template import, not native Helios API automation.
>
> The goal for day one is simple: complete intake, identify the first real gaps, and attach the first evidence. That gives you a concrete starting record for buyer, auditor, MSP, counsel, or NÚKIB-readiness discussions.

## What the dashboard means before intake

When the user first lands on the dashboard, the app may show the setup path:

1. Intake
2. Framework
3. Integration
4. First evidence

The user can browse the app, but the score and recommendations are not reliable until intake is complete.

Say this plainly:

> Before intake, the dashboard is not yet your real compliance picture. It is asking for enough context to decide which controls and frameworks matter for you.

Do not say:

- “Your compliance score is ready.”
- “You are compliant/non-compliant.”
- “Everything is automatically checked.”

## Step-by-step guidance for the user

### Step 1: Complete the intake

Tell the user:

> Click “Zahájit intake” / “Start intake”. Answer the questions about your company, sector, size, data, systems, cloud usage, AI usage, and business tools.

Why it matters:

- It scopes the controls.
- It selects likely frameworks.
- It marks priority gaps.
- It prevents generic checklists from becoming misleading.

Safe phrasing:

> The intake gives you a first scoped readiness view. It is not a legal classification by itself.

### Step 2: Confirm frameworks

After intake, tell the user to confirm which frameworks to track.

Typical examples:

- NIS2 / Czech ZoKB readiness for cybersecurity obligations and buyer evidence.
- GDPR for personal data handling.
- ISO 27001 as a security-management reference, not a certification claim.
- EU AI Act only if the organization uses AI systems in a relevant way.

Safe phrasing:

> Splnit.eu can help organize evidence against these frameworks, but the final legal applicability should be reviewed with counsel or a qualified advisor.

### Step 3: Review priority controls and gaps

Tell the user:

> Go to Controls and open the priority or gaps view. Start with red or review-needed controls, not with controls already looking fine.

Explain the statuses:

- `K posouzení` / To assess: no reliable evidence yet.
- `V revizi` / Manual review: evidence exists but needs human review or is customer-reported.
- `K opravě` / Gap: the answer or evidence indicates a missing control or weakness.
- `V souladu` / Pass: only safe where the app has a real basis for it.

For NÚKIB-readiness, emphasize:

> The first useful job is to know which gaps would be hard to explain to a buyer, MSP, auditor, or NÚKIB-facing process.

### Step 4: Connect one source or open one workspace

Tell the user to choose one realistic source first.

Supported integration-adapter direction:

- Microsoft 365
- GitHub
- AWS
- Hetzner Cloud
- OVHcloud
- ABRA Flexi

Manual Czech ERP workspace direction:

- Helios
- Pohoda
- Money S3 / S4

Important Helios wording:

> If you use Helios, open the Helios workspace. Today it is a guided manual evidence workspace with 19 seeded NIS2-mapped controls and CSV-assisted Splnit-template import. It is not a native Helios API connection.

For a user with no integrations ready:

> If you cannot connect a system today, that is fine. Start with manual evidence upload on one priority control.

### Step 5: Add the first evidence

Tell the user:

> Pick one priority control and attach one real piece of evidence. Do not try to complete the whole program on day one.

Good first evidence examples:

- screenshot of MFA configuration,
- access review export,
- backup job screenshot,
- backup restoration test record,
- policy PDF,
- vendor contract or DPA,
- network diagram,
- firewall rule export with sensitive details redacted,
- Helios access/user export mapped into the Splnit CSV template,
- incident response procedure,
- training record.

Safe phrasing:

> Uploading evidence does not automatically mean the control passes. Splnit.eu separates uploaded/customer-reported evidence from reviewed or measured evidence.

### Step 6: Use the first report or Trust Center only after evidence exists

Tell the user:

> Once you have intake, priority controls, and at least some evidence, you can use reports or Trust Center views for buyer-readiness conversations.

Important Trust Center boundary:

> Public Trust Center pages should show aggregate category-level posture, not individual control IDs, evidence filenames, or technical test timing.

## Czech SME / NÚKIB-specific explanation

If the user asks “why do I need this?” say:

> For many Czech SMEs, the immediate pressure is not submitting something directly to NÚKIB tomorrow. The pressure is being able to show buyers, partners, MSPs, auditors, or management that cybersecurity evidence exists, gaps are known, and ownership is clear. Splnit.eu helps build that evidence trail around NIS2/ZoKB readiness.

If the user asks “will this make us compliant?” say:

> No tool can honestly promise that by itself. Splnit.eu helps you prepare evidence, identify gaps, and organize the work. Final legal classification and formal compliance decisions should be reviewed by counsel, auditors, or qualified security advisors.

If the user asks “does this send data to NÚKIB?” say:

> No. Splnit.eu does not currently submit directly to a NÚKIB portal API. It helps prepare and organize the evidence and reports you would need for readiness and review.

## Recommended founder demo script

Use this sequence in a call:

1. “You are on the dashboard. Right now the main button is the important thing: start intake.”
2. “The intake tells us what type of company you are and which controls probably matter.”
3. “After intake, the dashboard becomes useful: score, active frameworks, failed controls, and priority activity.”
4. “We then go to Controls and look at priority gaps first.”
5. “Now we attach one evidence item. This is the activation moment.”
6. “If you use Helios or another Czech ERP, we open that workspace. For Helios, use the Splnit CSV template or manual questions. It is not native API automation yet.”
7. “Once evidence exists, we can talk about reporting, Trust Center, vendor requests, and next remediation tasks.”

## What not to say

Do not say:

- “You are now NIS2 compliant.”
- “Splnit sends this directly to NÚKIB.”
- “Helios evidence is collected automatically.”
- “Upload your native Helios export.”
- “The score is legally authoritative.”
- “This replaces counsel, auditor, MSP, or security review.”
- “We are certified / SOC 2 / ISO certified / pentested” unless real proof exists and the exact wording is approved.
- “All integrations are production-proven for customer tenants.”

Say instead:

- “This prepares your evidence trail.”
- “This identifies priority gaps.”
- “This is readiness support, not a legal opinion.”
- “This is a manual workspace / customer-reported import where applicable.”
- “Automated checks depend on the connected provider and permissions.”

## User question examples and safe answers

### “I have just registered and I am in the dashboard. What next?”

Answer:

> Start with the intake. It scopes your company and tells Splnit.eu which controls are relevant. After that, review priority gaps, connect one source or open your ERP workspace, then attach your first evidence item. Your day-one goal is one useful evidence-backed control, not a perfect score.

### “Which integration should I connect first?”

Answer:

> Pick the system that can produce the most useful security evidence quickly. For many SMEs that is Microsoft 365 for identity/MFA evidence, GitHub for code/security workflow evidence, AWS/Hetzner/OVHcloud for infrastructure evidence, or ABRA Flexi if your ERP setup is relevant. If you use Helios, start with the Helios workspace and Splnit CSV template, not an API connection.

### “We use Helios. What should I do?”

Answer:

> Open the Helios workspace. It has 19 NIS2-mapped manual controls covering infrastructure, access, backups, and integrations/API exposure. Answer the workspace questions and attach evidence. If you have exports/lists, map them into the Splnit Helios CSV template. Those imports are treated as customer-reported evidence, so they create review items or gaps, not automatic pass results.

### “Why is my score empty or pending?”

Answer:

> The score becomes meaningful after intake and the first control assessment/evidence. Before that, Splnit.eu does not have enough context to know which controls apply to your company.

### “Can I invite my MSP or advisor?”

Answer:

> The product has team, agency/MSP, and client workspace primitives. For the first pilot, the safest path is to complete intake and first evidence first, then decide whether to invite the MSP/advisor to review the priority gaps and evidence.

### “Can I use this for an audit or customer questionnaire?”

Answer:

> You can use it to organize evidence and prepare answers. Treat outputs as readiness material unless the specific evidence and wording have been reviewed. For buyer questionnaires, start with the controls and evidence that map to the buyer’s request.

### “Should I upload policies first?”

Answer:

> Uploading policies is useful, but start with the highest-risk priority gap. Sometimes that is a policy. Sometimes it is MFA, backups, access review, supplier evidence, or incident response. Splnit.eu is most useful when evidence is tied to a specific control.

### “What if we do not know whether NIS2 applies?”

Answer:

> Use the intake and NIS2 checker as an initial orientation. Splnit.eu can help structure the question and the evidence, but final applicability should be confirmed with counsel or a qualified advisor.

## The day-one success criteria

A new user has succeeded on day one if they have:

1. Completed intake.
2. Confirmed relevant frameworks.
3. Opened priority controls/gaps.
4. Connected one source or opened one workspace.
5. Attached or imported one real evidence item.
6. Understood at least one gap and next action.

Do not push them to solve everything in one sitting.

## The ideal next screen flow

From dashboard:

1. `/onboarding` for intake.
2. `/controls?scope=priority` for priority controls.
3. One of:
   - `/integrations` for supported adapters,
   - `/workspaces/helios` for Helios,
   - `/workspaces/pohoda`, `/workspaces/money-s3`, or `/workspaces/abra-flexi` where relevant.
4. `/evidence` or a specific control detail page for upload/review.
5. `/dashboard` again to see updated status.
6. Later: `/trust-center`, `/vendors`, `/risks`, `/incidents`, reports/exports.

## Internal note for Marco

The strongest support posture is calm and specific:

- “Do intake first.”
- “Then review priority gaps.”
- “Then attach the first evidence.”
- “Then use integrations/workspaces where they match your systems.”
- “This prepares evidence for NÚKIB/buyer/auditor conversations. It does not certify compliance.”

That is the core activation loop Splnit.eu should teach every new user.
