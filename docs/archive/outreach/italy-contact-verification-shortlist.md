# Italy Contact Verification Shortlist

Status: contact-verification worksheet, not a send list.
Date: 2026-05-05.
Source: `docs/outreach/italy-verification-batch-1.md`, `docs/outreach/italy-verification-batch-2.md`, and `docs/outreach/italy-verification-batch-3.md`.

The first 25-company verification queue produced 0 send-ready rows. The blocker is now contact quality, not company fit. This shortlist narrows the next pass to companies where the fit signal is strong enough to justify finding a named owner before drafting any first-touch email.

## Verification Rules

Do not send outreach from this file. A row moves into the send queue only when all are true:

1. Employee range is verified or accepted as an intentional exception.
2. One named role owner or defensible role inbox is identified.
3. The hook maps to that person's likely responsibility.
4. The tracker row remains `status=not_sent` until the email is actually sent.

## Tier 1 - Verify First

| Company | Why it stays in Tier 1 | Best owner to verify | Current contact signal | Next action |
| --- | --- | --- | --- | --- |
| Cubbit | Sovereign cloud storage, NIS2/GDPR/ISO 27001 positioning, 60+ employees, 400+ organizations, named leadership. | CTO, Head of Technology, VP Product & Partnerships, security/compliance owner. | Official about page names Marco Moschettini as Co-founder & CTO, Alessio Paccoia as Head of Technology, and Enrico Signoretti as VP Product & Partnerships. | Verify the best current owner and whether the angle is customer security evidence or partner ecosystem evidence. |
| Cleafy | Banking cybersecurity, DORA/NIS2 pressure, 90+ employees, 150+ financial institutions, clear vendor-risk angle. | CTO, product owner, security/compliance owner, vendor-risk owner. | Official press release names Matteo Bogana, Nicolò Pastore and Carmine Giangregorio as founding/product leadership. | Verify whether CTO/product or compliance/security is the right first-touch owner. |
| Netalia | Italian public cloud, ACN QC2, data sovereignty, LinkedIn 51-200 employees, strong PA/cloud evidence angle. | Security/compliance owner, public-sector cloud owner, partner owner. | Company fit and size verified; named owner still missing. | Find a named public-cloud/security/compliance owner before drafting email. |
| DigitalPA | PA-facing SaaS, procurement and whistleblowing workflows, GDPR, ISO 27001/22301, LinkedIn 51-200 employees. | Product security owner, compliance owner, PA/procurement product owner. | Company fit and size verified; named owner still missing. | Find product/security/compliance owner tied to PA SaaS or whistleblowing products. |
| Cyber Guru / LibraCyber | Awareness and compliance training for GDPR, PCI DSS, NIS2 and DORA, LinkedIn 51-200 employees, clear evidence-for-training angle. | Product owner, compliance-training owner, partner owner. | Rebrand to LibraCyber must be accounted for; direct owner not verified. | Verify current post-rebrand owner and whether outreach is customer discovery or partner-learning. |
| ReeVo Cloud & Cyber Security | Cloud and cybersecurity provider, ACN/AGID, ISO certifications, 51-200 employees, strong channel or customer evidence angle. | CISO/security owner, CTO/CIO, compliance owner, partner-channel owner. | Company fit and size verified; named owner still missing. | Decide customer vs channel angle before selecting the contact. |

## Tier 2 - Verify If Tier 1 Stalls

| Company | Why it remains useful | Blocking issue | Next action |
| --- | --- | --- | --- |
| Mia-Platform | Platform SaaS with regulated-sector and governance/compliance/risk language. | Current headcount and precise platform-governance/security owner are unresolved. | Verify current size, then find CTO/security/platform governance owner. |
| AtWorkStudio | ACN-qualified cloud services, ISO 27001/27017/27018 and NIS2 service signal. | Headcount and named owner unresolved. | Verify employee range and identify cloud/security/compliance owner. |
| Enter Med | Healthcare software, NIS2/ISO 27001 standards, 250+ clients and regulated data workflows. | Headcount and privacy/security owner unresolved. | Verify employee range and identify CTO/security/privacy owner. |
| Corelink | ISO 27001/27017/27018, SOC, managed IT, cybersecurity and continuity signal. | Headcount and security/commercial owner unresolved. | Verify employee range and decide customer vs channel angle. |
| Alveo | ACN Qualified, PA expertise, NIS2/ISO 27001 consulting and multiple offices. | Size and partner-vs-customer angle unresolved. | Verify if this is channel/partner outreach rather than design partner. |

## Learning Or Channel Only For Now

These rows should not consume first-wave contact-verification time unless the owner explicitly wants market learning:

- Cerbeyra, 40Factory, Keliweb, Ermes, Skybackbone Engenio, Cybersolvo: good fit signals but below the 50-250 ICP in current source checks.
- Swascan: incorporated into Tinexta Cyber; treat as enterprise ecosystem research, not a standalone SMB design-partner target.
- Simeds, noze, My Way Security: useful learning candidates, but size/contact quality is still too uncertain for the first wave.

## Next Action

Run a contact-quality pass on the six Tier 1 rows only. The output should be a small send-candidate worksheet with one named owner, role, source link, and exact hook per company. Do not update `docs/outreach/italy-target-tracker.csv` until the owner is verified.
