import { readFileSync } from "node:fs";
import * as path from "node:path";

const locales = ["en-EU", "it-IT", "cs-CZ"] as const;
const strict = process.argv.includes("--strict");
const useOpenAi = process.argv.includes("--openai") || Boolean(process.env.OPENAI_API_KEY?.trim());
const model = process.env.OPENAI_COPY_LINT_MODEL?.trim() || "gpt-4.1-mini";

type CopyItem = {
  key: string;
  locale: string;
  text: string;
};

type Finding = {
  check: "deterministic" | "openai";
  key: string;
  locale: string;
  severity: "info" | "warning" | "blocker";
  issue: string;
  suggestion?: string;
};

const trackedPaths = [
  "dashboard.intakeScope.subtitle",
  "dashboard.intakeScope.priority",
  "dashboard.intakeScope.outOfScope",
  "controlsPage.index.priorityScope",
  "controlsPage.index.outOfScope",
  "controlsPage.index.priorityLabel",
  "controlsPage.index.rationaleLabel",
  "controlsPage.statuses.not_applicable",
  "controlsPage.statuses.out_of_scope",
];

const hardClaimPatterns = [
  { pattern: /\bfully compliant\b/i, issue: "Claims full compliance." },
  { pattern: /\bcompliance achieved\b/i, issue: "Implies compliance has been achieved." },
  { pattern: /\bcertified\b/i, issue: "Implies certification proof exists." },
  { pattern: /\bcertification achieved\b/i, issue: "Implies certification proof exists." },
  { pattern: /\blegally required\b/i, issue: "Sounds like legal advice rather than intake-based guidance." },
  { pattern: /\blegal determination\b/i, issue: "Sounds like a legal determination." },
  { pattern: /\bguaranteed\b/i, issue: "Overstates certainty." },
];

function readJson(pathname: string) {
  return JSON.parse(readFileSync(pathname, "utf8")) as Record<string, unknown>;
}

function getPath(input: unknown, dottedPath: string) {
  return dottedPath.split(".").reduce<unknown>((value, segment) => {
    if (!value || typeof value !== "object") {
      return undefined;
    }
    return (value as Record<string, unknown>)[segment];
  }, input);
}

function collectCopy() {
  const items: CopyItem[] = [];
  for (const locale of locales) {
    const messagesPath = path.join(process.cwd(), "messages", `${locale}.json`);
    const messages = readJson(messagesPath);
    for (const key of trackedPaths) {
      const value = getPath(messages, key);
      if (typeof value !== "string") {
        items.push({ key, locale, text: "" });
      } else {
        items.push({ key, locale, text: value });
      }
    }
  }
  return items;
}

function deterministicFindings(items: CopyItem[]) {
  const findings: Finding[] = [];

  for (const item of items) {
    if (!item.text.trim()) {
      findings.push({
        check: "deterministic",
        issue: "Tracked copy string is missing or empty.",
        key: item.key,
        locale: item.locale,
        severity: "blocker",
      });
      continue;
    }

    for (const { pattern, issue } of hardClaimPatterns) {
      if (pattern.test(item.text)) {
        findings.push({
          check: "deterministic",
          issue,
          key: item.key,
          locale: item.locale,
          severity: "blocker",
          suggestion: "Rewrite as conditional guidance based on intake, without implying legal/compliance proof.",
        });
      }
    }

    if (/priority/i.test(item.key) && !/intake|vstup|input|questionario|risposte/i.test(item.text)) {
      findings.push({
        check: "deterministic",
        issue: "Priority copy should be explicitly intake-based.",
        key: item.key,
        locale: item.locale,
        severity: "warning",
        suggestion: "Include wording equivalent to 'based on your intake'.",
      });
    }
  }

  return findings;
}

async function openAiFindings(items: CopyItem[]) {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return {
      skipped: true,
      findings: [] as Finding[],
      reason: "OPENAI_API_KEY missing; deterministic lint completed only.",
    };
  }

  const prompt = `Review these Splnit.eu intake-prioritization UI strings. Return JSON only with shape {"findings":[{"locale":"...","key":"...","severity":"info|warning|blocker","issue":"...","suggestion":"..."}]}.

Criteria:
- Must not imply compliance has been achieved.
- Must not imply certification, legal determination, or legal advice.
- Prefer conditional wording like "based on your intake".
- Treat not applicable as currently not applicable based on provided intake, not permanent legal judgment.
- "Out of scope / not applicable" must not sound like "done".
- Flag issues for human review; be conservative and do not rewrite unrelated copy.

Strings:
${JSON.stringify(items, null, 2)}`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    body: JSON.stringify({
      messages: [
        { role: "system", content: "You are a concise product/legal-risk copy reviewer. Return valid JSON only." },
        { role: "user", content: prompt },
      ],
      model,
      response_format: { type: "json_object" },
      temperature: 0,
    }),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    const body = await response.text();
    return {
      skipped: true,
      findings: [] as Finding[],
      reason: `OpenAI request failed with HTTP ${response.status}: ${body.slice(0, 240)}`,
    };
  }

  const payload = await response.json() as {
    choices?: { message?: { content?: string } }[];
  };
  const content = payload.choices?.[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(content) as { findings?: Omit<Finding, "check">[] };

  return {
    skipped: false,
    findings: (parsed.findings ?? []).map((finding) => ({ ...finding, check: "openai" as const })),
    reason: null,
  };
}

async function main() {
  const items = collectCopy();
  const deterministic = deterministicFindings(items);
  const ai = useOpenAi
    ? await openAiFindings(items)
    : { skipped: true, findings: [] as Finding[], reason: "OpenAI review not requested; pass --openai or set OPENAI_API_KEY." };

  const findings = [...deterministic, ...ai.findings];
  const blockers = findings.filter((finding) => finding.severity === "blocker");

  console.log(JSON.stringify({
    checkedStrings: items.length,
    deterministicFindings: deterministic.length,
    openAiModel: useOpenAi && !ai.skipped ? model : null,
    openAiSkipped: ai.skipped,
    openAiSkipReason: ai.reason,
    findings,
    strict,
  }, null, 2));

  if (strict && blockers.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
