#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parse } from "dotenv";

const projectDir = process.cwd();
const envPath = process.env.MAILBOX_RECEIPT_ENV_FILE
  ? resolve(projectDir, process.env.MAILBOX_RECEIPT_ENV_FILE)
  : resolve(projectDir, ".env.local");

if (existsSync(envPath)) {
  const parsed = parse(readFileSync(envPath));
  for (const [key, value] of Object.entries(parsed)) {
    if (!process.env[key]?.trim() && value.trim()) {
      process.env[key] = value;
    }
  }
}

const recipient = process.env.SMOKE_RECIPIENT_EMAIL?.trim();
const tenantId = process.env.MICROSOFT_GRAPH_TENANT_ID?.trim();
const clientId = process.env.MICROSOFT_GRAPH_CLIENT_ID?.trim();
const clientSecret = process.env.MICROSOFT_GRAPH_CLIENT_SECRET?.trim();
const mailboxUser = process.env.MICROSOFT_GRAPH_MAILBOX_USER_ID?.trim()
  ?? process.env.MICROSOFT_GRAPH_MAILBOX_USER?.trim();
const pageSize = Number.parseInt(process.env.MAILBOX_RECEIPT_PAGE_SIZE ?? "50", 10);
const expectedSubjects = [
  "Vendor security questionnaire",
  "Bezpečnostní dotazník dodavatele",
  "Questionario di sicurezza fornitore",
];

function redactEmail(value) {
  if (!value || !value.includes("@")) {
    return value ? "present_non_email" : null;
  }
  const [local, domain] = value.split("@");
  return `${local.slice(0, 2)}***@${domain}`;
}

function output(payload) {
  console.log(JSON.stringify({
    note: "Controlled mailbox receipt is separate from Resend send-attempt status.",
    ...payload,
  }, null, 2));
}

function normalizeGraphMessage(message) {
  const toRecipients = Array.isArray(message.toRecipients) ? message.toRecipients : [];
  const ccRecipients = Array.isArray(message.ccRecipients) ? message.ccRecipients : [];
  const recipients = [...toRecipients, ...ccRecipients]
    .map((entry) => entry?.emailAddress?.address ?? entry?.emailAddress?.name ?? "")
    .filter(Boolean);

  return {
    date: String(message.receivedDateTime ?? message.sentDateTime ?? ""),
    from: String(message.from?.emailAddress?.address ?? message.sender?.emailAddress?.address ?? ""),
    id: message.id ?? null,
    internetMessageId: message.internetMessageId ?? null,
    subject: String(message.subject ?? ""),
    to: recipients,
    webLink: message.webLink ?? null,
  };
}

function messageMatches(message) {
  const normalized = normalizeGraphMessage(message);
  const haystack = `${normalized.subject}\n${normalized.from}\n${normalized.to.join("\n")}`.toLowerCase();
  const recipientMatches = recipient ? haystack.includes(recipient.toLowerCase()) : true;
  const subjectMatches = expectedSubjects.some((subject) => haystack.includes(subject.toLowerCase()));
  return subjectMatches && recipientMatches;
}

function graphErrorDetails(status, text) {
  try {
    const parsed = JSON.parse(text);
    return {
      status,
      code: parsed?.error?.code ?? null,
      message: parsed?.error?.message ?? text.slice(0, 1000),
    };
  } catch {
    return { status, message: text.slice(0, 1000) };
  }
}

const missing = [];
if (!recipient) missing.push("SMOKE_RECIPIENT_EMAIL");
if (!tenantId) missing.push("MICROSOFT_GRAPH_TENANT_ID");
if (!clientId) missing.push("MICROSOFT_GRAPH_CLIENT_ID");
if (!clientSecret) missing.push("MICROSOFT_GRAPH_CLIENT_SECRET");
if (!mailboxUser) missing.push("MICROSOFT_GRAPH_MAILBOX_USER_ID");

if (missing.length > 0) {
  output({
    ok: false,
    mailboxReceiptVerified: false,
    reason: "microsoft_graph_not_configured",
    missing,
    recipient: redactEmail(recipient),
    mailboxUser: redactEmail(mailboxUser),
    required: [
      "Configure a Microsoft Entra app with Microsoft Graph Mail.Read access to the real mailbox that receives SMOKE_RECIPIENT_EMAIL alias mail.",
      "Set MICROSOFT_GRAPH_TENANT_ID, MICROSOFT_GRAPH_CLIENT_ID, MICROSOFT_GRAPH_CLIENT_SECRET, and MICROSOFT_GRAPH_MAILBOX_USER_ID.",
      "MICROSOFT_GRAPH_MAILBOX_USER_ID should be the real licensed mailbox, for example marco@splnit.eu, not an alias like smoke@splnit.eu.",
    ],
    expectedSubjects,
  });
  process.exit(1);
}

const tokenResponse = await fetch(`https://login.microsoftonline.com/${encodeURIComponent(tenantId)}/oauth2/v2.0/token`, {
  method: "POST",
  headers: { "content-type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "client_credentials",
    scope: "https://graph.microsoft.com/.default",
  }),
});

const tokenBody = await tokenResponse.text();
if (!tokenResponse.ok) {
  output({
    ok: false,
    mailboxReceiptVerified: false,
    reason: "microsoft_graph_token_failed",
    recipient: redactEmail(recipient),
    mailboxUser: redactEmail(mailboxUser),
    graphError: graphErrorDetails(tokenResponse.status, tokenBody),
    expectedSubjects,
  });
  process.exit(1);
}

let accessToken;
try {
  accessToken = JSON.parse(tokenBody).access_token;
} catch (error) {
  output({
    ok: false,
    mailboxReceiptVerified: false,
    reason: "microsoft_graph_token_output_not_json",
    recipient: redactEmail(recipient),
    mailboxUser: redactEmail(mailboxUser),
    error: error instanceof Error ? error.message : "JSON parse failed",
    expectedSubjects,
  });
  process.exit(1);
}

if (!accessToken) {
  output({
    ok: false,
    mailboxReceiptVerified: false,
    reason: "microsoft_graph_token_missing_access_token",
    recipient: redactEmail(recipient),
    mailboxUser: redactEmail(mailboxUser),
    expectedSubjects,
  });
  process.exit(1);
}

function decodeJwtPayload(token) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(Buffer.from(payload.replace(/-/g, "+").replace(/_/g, "/"), "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

const tokenClaims = decodeJwtPayload(accessToken);
const tokenRoles = Array.isArray(tokenClaims?.roles) ? tokenClaims.roles : [];
if (!tokenRoles.includes("Mail.Read")) {
  output({
    ok: false,
    mailboxReceiptVerified: false,
    reason: "microsoft_graph_mail_read_application_permission_missing",
    recipient: redactEmail(recipient),
    mailboxUser: redactEmail(mailboxUser),
    required: [
      "In the app registration API permissions, add Microsoft Graph → Application permissions → Mail.Read.",
      "Click Grant admin consent for the splnit tenant after adding the Application permission.",
      "Delegated Mail.Read is not enough for this verifier because it uses client credentials.",
    ],
    token: {
      audience: tokenClaims?.aud ?? null,
      tenantId: tokenClaims?.tid ?? null,
      appId: tokenClaims?.appid ?? tokenClaims?.azp ?? null,
      roles: tokenRoles,
      scopes: tokenClaims?.scp ?? null,
    },
    expectedSubjects,
  });
  process.exit(1);
}

const top = String(Number.isFinite(pageSize) && pageSize > 0 ? Math.min(pageSize, 100) : 50);
const select = "id,subject,from,sender,toRecipients,ccRecipients,receivedDateTime,sentDateTime,internetMessageId,webLink";
const messagesUrl = new URL(`https://graph.microsoft.com/v1.0/users/${encodeURIComponent(mailboxUser)}/mailFolders/inbox/messages`);
messagesUrl.searchParams.set("$top", top);
messagesUrl.searchParams.set("$orderby", "receivedDateTime desc");
messagesUrl.searchParams.set("$select", select);

const messagesResponse = await fetch(messagesUrl, {
  headers: {
    authorization: `Bearer ${accessToken}`,
    accept: "application/json",
  },
});

const messagesBody = await messagesResponse.text();
if (!messagesResponse.ok) {
  output({
    ok: false,
    mailboxReceiptVerified: false,
    reason: "microsoft_graph_messages_failed",
    recipient: redactEmail(recipient),
    mailboxUser: redactEmail(mailboxUser),
    graphError: graphErrorDetails(messagesResponse.status, messagesBody),
    expectedSubjects,
  });
  process.exit(1);
}

let messages;
try {
  messages = JSON.parse(messagesBody).value;
} catch (error) {
  output({
    ok: false,
    mailboxReceiptVerified: false,
    reason: "microsoft_graph_messages_output_not_json",
    recipient: redactEmail(recipient),
    mailboxUser: redactEmail(mailboxUser),
    error: error instanceof Error ? error.message : "JSON parse failed",
    expectedSubjects,
  });
  process.exit(1);
}

const messageList = Array.isArray(messages) ? messages : [];
const matches = messageList.filter(messageMatches).map(normalizeGraphMessage);

output({
  ok: matches.length > 0,
  mailboxReceiptVerified: matches.length > 0,
  reason: matches.length > 0 ? "controlled_mailbox_received_smoke_email" : "controlled_mailbox_no_matching_receipt_found",
  recipient: redactEmail(recipient),
  mailboxUser: redactEmail(mailboxUser),
  checkedMessageCount: messageList.length,
  expectedSubjects,
  matches: matches.slice(0, 5).map((match) => ({
    date: match.date,
    id: match.id,
    internetMessageId: match.internetMessageId,
    subject: match.subject,
  })),
});

if (matches.length === 0) {
  process.exitCode = 1;
}
