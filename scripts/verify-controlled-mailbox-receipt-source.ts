import { match } from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync("scripts/verify-controlled-mailbox-receipt.mjs", "utf8");

for (const requiredText of [
  "mailboxReceiptVerified",
  "microsoft_graph_not_configured",
  "microsoft_graph_mail_read_application_permission_missing",
  "MICROSOFT_GRAPH_TENANT_ID",
  "MICROSOFT_GRAPH_CLIENT_ID",
  "MICROSOFT_GRAPH_CLIENT_SECRET",
  "MICROSOFT_GRAPH_MAILBOX_USER_ID",
  "https://graph.microsoft.com/v1.0/users/",
  "SMOKE_RECIPIENT_EMAIL",
  "Vendor security questionnaire",
  "Bezpečnostní dotazník dodavatele",
  "Controlled mailbox receipt is separate from Resend send-attempt status",
]) {
  match(source, new RegExp(requiredText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `receipt verifier must include ${requiredText}`);
}

console.log("controlled mailbox receipt verifier source guard passed");
