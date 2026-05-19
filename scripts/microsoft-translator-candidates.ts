import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { randomUUID } from "node:crypto";

type Locale = "en-EU" | "it-IT" | "cs-CZ";

type Candidate = {
  location: string;
  source: string;
  currentTarget: string;
  microsoft: string;
  placeholderStatus: "ok" | "mismatch";
  guardrailFlags: string[];
};

const localeToMicrosoft: Record<Locale, string> = {
  "en-EU": "en",
  "it-IT": "it",
  "cs-CZ": "cs",
};

const args = new Map<string, string>();
for (let index = 2; index < process.argv.length; index += 1) {
  const arg = process.argv[index];
  if (!arg.startsWith("--")) continue;
  const [rawKey, inlineValue] = arg.slice(2).split("=", 2);
  const nextValue = process.argv[index + 1];
  if (inlineValue !== undefined) {
    args.set(rawKey, inlineValue);
  } else if (nextValue && !nextValue.startsWith("--")) {
    args.set(rawKey, nextValue);
    index += 1;
  } else {
    args.set(rawKey, "true");
  }
}

const fromLocale = (args.get("from") ?? "en-EU") as Locale;
const toLocale = (args.get("to") ?? "it-IT") as Locale;
const scope = args.get("scope") ?? "blog-page";
const limit = Number(args.get("limit") ?? "0");
const maxChars = Number(args.get("max-chars") ?? "200");
const keyFilter = args.get("keys")?.split(",").map((value) => value.trim()).filter(Boolean) ?? [];
const excludedKeyFragments = [".locale"];

function loadDotEnv(path: string) {
  try {
    const text = readFileSync(path, "utf8");
    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
      const [key, ...rest] = trimmed.split("=");
      if (process.env[key]) continue;
      let value = rest.join("=").trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  } catch {
    // Optional local env file.
  }
}

loadDotEnv(".env.local");
loadDotEnv(".env");

const configuredSubscriptionKey = process.env.MICROSOFT_TRANSLATOR_KEY ?? process.env.AZURE_TRANSLATOR_KEY;
const region = process.env.MICROSOFT_TRANSLATOR_REGION ?? process.env.AZURE_TRANSLATOR_REGION;
const endpoint = process.env.MICROSOFT_TRANSLATOR_ENDPOINT ?? "https://api.cognitive.microsofttranslator.com";

if (!configuredSubscriptionKey) {
  console.error(
    "Missing MICROSOFT_TRANSLATOR_KEY or AZURE_TRANSLATOR_KEY. Add it to .env.local before running Microsoft Translator candidates.",
  );
  process.exit(1);
}

const subscriptionKey = configuredSubscriptionKey;

if (!localeToMicrosoft[fromLocale] || !localeToMicrosoft[toLocale]) {
  throw new Error(`Unsupported locale pair: ${fromLocale} -> ${toLocale}`);
}

function flatten(value: unknown, prefix = ""): Record<string, string> {
  if (typeof value === "string") return { [prefix]: value };
  if (Array.isArray(value)) {
    return Object.fromEntries(value.flatMap((item, index) => Object.entries(flatten(item, `${prefix}[${index}]`))));
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).flatMap(([key, item]) => Object.entries(flatten(item, prefix ? `${prefix}.${key}` : key))),
    );
  }
  return {};
}

function extractLocaleObjectBlock(source: string, locale: Locale) {
  const marker = `  "${locale}": {`;
  const start = source.indexOf(marker);
  if (start === -1) throw new Error(`Could not find blogPageCopy locale block for ${locale}`);

  const openBrace = source.indexOf("{", start);
  let depth = 0;
  let quote: string | null = null;
  let escaped = false;

  for (let index = openBrace; index < source.length; index += 1) {
    const char = source[index];
    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === quote) {
        quote = null;
      }
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }
    if (char === "{") depth += 1;
    if (char === "}") depth -= 1;
    if (depth === 0) return source.slice(openBrace, index + 1);
  }

  throw new Error(`Could not parse blogPageCopy locale block for ${locale}`);
}

function unquoteStringLiteral(value: string) {
  return Function(`"use strict"; return (${value});`)() as string;
}

function extractStringProperties(block: string) {
  const out: Record<string, string> = {};
  const propertyRe = /([a-zA-Z][a-zA-Z0-9_]*):\s*((?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'))/g;
  for (const match of Array.from(block.matchAll(propertyRe))) {
    out[match[1]] = unquoteStringLiteral(match[2]);
  }
  return out;
}

function extractItems() {
  if (scope === "messages") {
    const source = flatten(JSON.parse(readFileSync(`messages/${fromLocale}.json`, "utf8")));
    const target = flatten(JSON.parse(readFileSync(`messages/${toLocale}.json`, "utf8")));
    return Object.entries(source).map(([key, value]) => ({
      location: `messages/${toLocale}.json:${key}`,
      source: value,
      currentTarget: target[key] ?? "",
    }));
  }

  if (scope === "blog-page") {
    const blogSource = readFileSync("lib/marketing/blog.ts", "utf8");
    const source = extractStringProperties(extractLocaleObjectBlock(blogSource, fromLocale));
    const target = extractStringProperties(extractLocaleObjectBlock(blogSource, toLocale));
    return Object.entries(source).map(([key, value]) => ({
      location: `lib/marketing/blog.ts:blogPageCopy.${toLocale}.${key}`,
      source: value,
      currentTarget: target[key] ?? "",
    }));
  }

  throw new Error(`Unsupported scope '${scope}'. Use --scope blog-page or --scope messages.`);
}

function placeholders(value: string) {
  return Array.from(value.matchAll(/\{[^{}]+\}/g)).map((match) => match[0]).sort();
}

function escapeMarkdown(value: string) {
  return value.replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

function guardrailFlags(source: string, microsoft: string) {
  const flags: string[] = [];
  const sourceLower = source.toLowerCase();
  if (source.includes("EU AI Act") && /legge\s+ue\s+sull['’]ia/i.test(microsoft)) {
    flags.push("EU AI Act translated as legge UE sull'IA");
  }

  if (source.includes("AI Act") && !microsoft.includes("AI Act")) {
    flags.push("AI Act missing from suggestion");
  }

  if (
    sourceLower.includes("evidence") &&
    /\bprove\b/i.test(microsoft) &&
    !/prove\s+di\s+conformit[àa]/i.test(microsoft)
  ) {
    flags.push("evidence translated as generic prove");
  }

  if (sourceLower.includes("legal noise") && /problemi\s+legali/i.test(microsoft)) {
    flags.push("legal noise translated as problemi legali");
  }

  if (source.includes("Trust Center") && !microsoft.includes("Trust Center")) {
    flags.push("Trust Center translated or removed");
  }

  for (const token of ["DPA", "SLA", "NIS2", "GDPR", "ISO 27001"]) {
    if (source.includes(token) && !microsoft.includes(token)) {
      flags.push(`${token} mutated or removed`);
    }
  }

  return flags;
}

async function translateBatch(texts: string[]) {
  const url = new URL("/translate", endpoint);
  url.searchParams.set("api-version", "3.0");
  url.searchParams.set("from", localeToMicrosoft[fromLocale]);
  url.searchParams.set("to", localeToMicrosoft[toLocale]);
  url.searchParams.set("textType", "plain");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Ocp-Apim-Subscription-Key": subscriptionKey,
    "X-ClientTraceId": randomUUID(),
  };
  if (region) headers["Ocp-Apim-Subscription-Region"] = region;

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(texts.map((Text) => ({ Text }))),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Microsoft Translator HTTP ${response.status}: ${body.slice(0, 1000)}`);
  }

  const data = (await response.json()) as { translations: { text: string; to: string }[] }[];
  return data.map((item) => item.translations[0]?.text ?? "");
}

async function main() {
  let items = extractItems()
    .filter((item) => item.source.length > 0)
    .filter((item) => !excludedKeyFragments.some((fragment) => item.location.endsWith(fragment)))
    .filter((item) => item.source.length <= maxChars)
    .filter((item) => keyFilter.length === 0 || keyFilter.some((filter) => item.location.includes(filter)));

  if (limit > 0) items = items.slice(0, limit);

  const candidates: Candidate[] = [];
  const batchSize = 50;
  for (let index = 0; index < items.length; index += batchSize) {
    const batch = items.slice(index, index + batchSize);
    const translations = await translateBatch(batch.map((item) => item.source));
    for (let inner = 0; inner < batch.length; inner += 1) {
      const item = batch[inner];
      const microsoft = translations[inner] ?? "";
      candidates.push({
        ...item,
        microsoft,
        placeholderStatus:
          JSON.stringify(placeholders(item.source)) === JSON.stringify(placeholders(microsoft)) ? "ok" : "mismatch",
        guardrailFlags: guardrailFlags(item.source, microsoft),
      });
    }
  }

  mkdirSync("tmp", { recursive: true });
  const base = `tmp/microsoft-translator-${fromLocale}-to-${toLocale}-${scope}`;
  writeFileSync(`${base}.json`, `${JSON.stringify({ fromLocale, toLocale, scope, candidates }, null, 2)}\n`);

  const rows = candidates.map(
    (candidate) =>
      `| \`${escapeMarkdown(candidate.location)}\` | ${escapeMarkdown(candidate.source)} | ${escapeMarkdown(candidate.currentTarget)} | ${escapeMarkdown(candidate.microsoft)} | ${candidate.placeholderStatus} | ${candidate.guardrailFlags.length > 0 ? escapeMarkdown(candidate.guardrailFlags.join("; ")) : "—"} |`,
  );

  writeFileSync(
    `${base}.md`,
    [
      `# Microsoft Translator candidates: ${fromLocale} → ${toLocale}`,
      "",
      "Report only. No source files were changed.",
      "",
      `- Scope: ${scope}`,
      `- Candidates: ${candidates.length}`,
      `- Placeholder mismatches: ${candidates.filter((candidate) => candidate.placeholderStatus === "mismatch").length}`,
      `- Guardrail flags: ${candidates.filter((candidate) => candidate.guardrailFlags.length > 0).length}`,
      "",
      "| location | English source | current target | Microsoft Translator | placeholders | guardrails |",
      "|---|---|---|---|---|---|",
      ...rows,
      "",
    ].join("\n"),
  );

  console.log(
    JSON.stringify(
      {
        candidates: candidates.length,
        placeholderMismatches: candidates.filter((candidate) => candidate.placeholderStatus === "mismatch").length,
        guardrailFlags: candidates.filter((candidate) => candidate.guardrailFlags.length > 0).length,
        json: `${base}.json`,
        markdown: `${base}.md`,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
