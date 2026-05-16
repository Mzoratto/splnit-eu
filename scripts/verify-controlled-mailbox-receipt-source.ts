import { match } from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync("scripts/verify-controlled-mailbox-receipt.mjs", "utf8");

for (const requiredText of [
  "mailboxReceiptVerified",
  "mailbox_reader_not_configured",
  "himalaya",
  "SMOKE_RECIPIENT_EMAIL",
  "Vendor security questionnaire",
  "Bezpečnostní dotazník dodavatele",
  "Controlled mailbox receipt is separate from Resend send-attempt status",
]) {
  match(source, new RegExp(requiredText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `receipt verifier must include ${requiredText}`);
}

console.log("controlled mailbox receipt verifier source guard passed");
