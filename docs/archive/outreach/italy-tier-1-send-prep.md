# Italy Tier 1 Send Prep

Status: manual send-prep, not sent.
Date: 2026-05-06.
Source: `docs/outreach/italy-first-touch-drafts-tier-1.md`.

This file records the current public route for the first three Tier 1 outreach drafts. It is not a sending log. Update `docs/outreach/italy-target-tracker.csv` only after the owner chooses the exact route and sends the message.

## Send-Prep Rows

| Company | Preferred owner | Public route verified? | Recommended first route | Send readiness | Tracker action |
| --- | --- | --- | --- | --- | --- |
| Cubbit | Enrico Signoretti, VP Product & Partnerships. Alternate: Marco Moschettini, Co-founder & CTO. | Yes, but generic. Cubbit's public about/contact flow says requests are escalated internally and lists `hello@cubbit.io`. | Email `hello@cubbit.io` with first line `Alla cortese attenzione di Enrico Signoretti / Marco Moschettini`, or use LinkedIn manual route if the owner can verify the profile. | Ready for owner review, not sent. | If approved, set `contact_name`, `contact_title`, route in `email` or `contact_linkedin`, and keep `status=not_sent` until sent. |
| Cleafy | Nicolò Pastore, Co-founder & CTO. Alternate: Carmine Giangregorio, Co-founder & Product Manager. | Yes, via official contact form. Public `media@cleafy.com` is PR-only and should not be used for design-partner outreach. | Use Cleafy's contact form with the owner name in the opening line, unless the owner manually verifies a named LinkedIn route. | Ready for owner review, not sent. | Do not update tracker email with `media@`; use the contact form or a verified LinkedIn route. |
| DigitalPA | Andrea Puggioni, CTO & Founder. Alternate: Matteo Serra, CIO. | Yes. DigitalPA exposes `contatti@digitalpa.it`, contact/demo forms and phone `+39 070 3495386`. | Email `contatti@digitalpa.it` with first line `Alla cortese attenzione di Andrea Puggioni / Matteo Serra`, or use the contact/demo form selecting Risk & Compliance / software interest. | Ready for owner review, not sent. | If approved, set `contact_name`, `contact_title`, `email=contatti@digitalpa.it`, and keep `status=not_sent` until sent. |

## Source URLs

- Cubbit about page: https://www.cubbit.io/it/about-us
- Cubbit contact page: https://cubbit.tech/contact-us.html
- Cleafy get in touch: https://www.cleafy.com/get-in-touch
- Cleafy Nicolò Pastore profile: https://www.cleafy.com/authors/nicolo-pastore
- Cleafy Carmine Giangregorio profile: https://www.cleafy.com/authors/carmine-giangregorio
- DigitalPA leadership: https://www.digitalpa.it/societa/leadership.html
- DigitalPA contacts: https://www.digitalpa.it/contatti
- DigitalPA English contacts: https://www.digitalpa.net/en/contacts/
- DigitalPA thank-you page with email: https://www.digitalpa.net/it/grazie-per-averci-contattato/

## Manual Sending Checklist

Before sending any of the three:

1. Replace all placeholders in `docs/outreach/italy-first-touch-drafts-tier-1.md`.
2. Confirm whether the sender block should use `OSVČ / IČO` or an Italian parenthetical explanation.
3. If using a generic inbox/form, put the named owner in the first line and keep the email short.
4. Update only the exact tracker row after sending:
   - `contact_name`
   - `contact_title`
   - `contact_linkedin` or `email`
   - `status=sent`
   - `first_touch_date`
5. Do not send more than these three before reviewing replies or lack of replies.
