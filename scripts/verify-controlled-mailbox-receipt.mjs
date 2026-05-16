#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
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

function commandExists(command) {
  const result = spawnSync("sh", ["-lc", `command -v ${command}`], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  return result.status === 0 && result.stdout.trim().length > 0;
}

function normalizeEnvelope(envelope) {
  const subject = String(envelope.subject ?? envelope.Subject ?? "");
  const from = JSON.stringify(envelope.from ?? envelope.sender ?? envelope.From ?? "");
  const to = JSON.stringify(envelope.to ?? envelope.recipients ?? envelope.To ?? "");
  const date = String(envelope.date ?? envelope.Date ?? envelope.internalDate ?? "");
  const id = envelope.id ?? envelope.uid ?? envelope.messageId ?? envelope["message-id"] ?? null;
  return { date, from, id, subject, to };
}

function envelopeMatches(envelope) {
  const normalized = normalizeEnvelope(envelope);
  const haystack = `${normalized.subject}\n${normalized.from}\n${normalized.to}`.toLowerCase();
  const recipientMatches = recipient ? haystack.includes(recipient.toLowerCase()) : true;
  const subjectMatches = expectedSubjects.some((subject) => haystack.includes(subject.toLowerCase()));
  return subjectMatches && recipientMatches;
}

if (!recipient) {
  output({
    ok: false,
    mailboxReceiptVerified: false,
    reason: "missing_smoke_recipient_email",
    missing: ["SMOKE_RECIPIENT_EMAIL"],
    expectedSubjects,
  });
  process.exit(1);
}

if (!commandExists("himalaya") || !existsSync(join(homedir(), ".config/himalaya/config.toml"))) {
  output({
    ok: false,
    mailboxReceiptVerified: false,
    reason: "mailbox_reader_not_configured",
    recipient: redactEmail(recipient),
    required: [
      "Install/configure himalaya for the controlled mailbox, or run this script on a machine where himalaya can read that mailbox.",
      "The mailbox reader must have IMAP access to SMOKE_RECIPIENT_EMAIL.",
    ],
    expectedSubjects,
  });
  process.exit(1);
}

const list = spawnSync("himalaya", [
  "envelope",
  "list",
  "--page-size",
  String(Number.isFinite(pageSize) && pageSize > 0 ? pageSize : 50),
  "--output",
  "json",
], {
  encoding: "utf8",
  stdio: ["ignore", "pipe", "pipe"],
});

if (list.status !== 0) {
  output({
    ok: false,
    mailboxReceiptVerified: false,
    reason: "mailbox_reader_failed",
    recipient: redactEmail(recipient),
    stderr: list.stderr.trim().slice(0, 1000),
    expectedSubjects,
  });
  process.exit(1);
}

let envelopes;
try {
  envelopes = JSON.parse(list.stdout);
} catch (error) {
  output({
    ok: false,
    mailboxReceiptVerified: false,
    reason: "mailbox_reader_output_not_json",
    recipient: redactEmail(recipient),
    error: error instanceof Error ? error.message : "JSON parse failed",
    expectedSubjects,
  });
  process.exit(1);
}

const envelopeList = Array.isArray(envelopes) ? envelopes : Object.values(envelopes).flat().filter((value) => typeof value === "object" && value !== null);
const matches = envelopeList.filter(envelopeMatches).map(normalizeEnvelope);

output({
  ok: matches.length > 0,
  mailboxReceiptVerified: matches.length > 0,
  reason: matches.length > 0 ? "controlled_mailbox_received_smoke_email" : "controlled_mailbox_no_matching_receipt_found",
  recipient: redactEmail(recipient),
  checkedEnvelopeCount: envelopeList.length,
  expectedSubjects,
  matches: matches.slice(0, 5).map((match) => ({
    date: match.date,
    id: match.id,
    subject: match.subject,
  })),
});

if (matches.length === 0) {
  process.exitCode = 1;
}
