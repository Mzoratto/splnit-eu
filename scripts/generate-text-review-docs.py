#!/usr/bin/env python3
"""Generate specialist review documents for all app text.

This is intentionally conservative: locale JSON is authoritative and fully
flattened; hardcoded extraction is heuristic and restricted to known copy-heavy
source files to avoid dumping implementation identifiers.
"""

from __future__ import annotations

import ast
import json
import re
from collections import defaultdict
from dataclasses import dataclass
from pathlib import Path
from typing import Any

LOCALES = {
    "en-EU": {"language": "English (EU)", "title": "English (EU) Text Review — splnit.eu"},
    "it-IT": {"language": "Italian", "title": "Italian Text Review — splnit.eu"},
    "cs-CZ": {"language": "Czech", "title": "Czech Text Review — splnit.eu"},
}

SECTION_ORDER = [
    "Global / Shell",
    "Onboarding",
    "Dashboard",
    "Frameworks",
    "Controls",
    "Evidence",
    "Policies",
    "Integrations",
    "Questionnaires",
    "Vendors",
    "Risks",
    "Incidents",
    "Team",
    "Trust Center (app)",
    "Trust Center (public)",
    "Settings",
    "Marketing / Public site",
    "Legal pages",
    "Auth surfaces",
    "Emails",
    "Errors and fallbacks",
    "Miscellaneous",
]

SECTION_KEY_HINTS = [
    ("Global / Shell", ["app.", "navigation.", "shell.", "footer.", "breadcrumbs.", "common."]),
    ("Onboarding", ["onboarding."]),
    ("Dashboard", ["dashboard."]),
    ("Frameworks", ["framework", "setup"]),
    ("Controls", ["control"]),
    ("Evidence", ["evidence"]),
    ("Policies", ["polic", "template"]),
    ("Integrations", ["integration", "github", "microsoft", "google", "aws"]),
    ("Questionnaires", ["questionnaire"]),
    ("Vendors", ["vendor", "supplier", "supplyChain"]),
    ("Risks", ["risk"]),
    ("Incidents", ["incident"]),
    ("Team", ["team", "accessReview", "role", "member", "client"]),
    ("Trust Center (app)", ["trustCenter"]),
    ("Trust Center (public)", ["publicTrust", "trust."]),
    ("Settings", ["settings", "billing", "organisation", "auditLog", "plan", "stripe"]),
    ("Marketing / Public site", ["marketing", "home", "pricing", "platform", "security", "status", "blog", "readiness", "nis2Scope", "earlyAccess", "customers"]),
    ("Legal pages", ["legal", "privacy", "terms", "dpa", "cookie", "cookies"]),
    ("Auth surfaces", ["auth", "signIn", "signUp", "clerk"]),
    ("Emails", ["email", "mail", "subject", "body", "reminder", "notification"]),
    ("Errors and fallbacks", ["error", "fallback", "notFound", "unavailable", "empty", "missing"]),
]

SECTION_FILE_HINTS = [
    ("Legal pages", ["legal", "cookies", "soukromi", "podminky", "dpa"]),
    ("Trust Center (public)", ["trust-center/public", "/trust/"]),
    ("Trust Center (app)", ["trust-center", "trust-center/page"]),
    ("Marketing / Public site", ["marketing", "(marketing)", "pricing", "platform", "security", "status", "nis2-scope", "blog", "early-access"]),
    ("Policies", ["policies"]),
    ("Questionnaires", ["questionnaires"]),
    ("Emails", ["email", "notifications", "reminders"]),
    ("Incidents", ["incidents"]),
    ("Vendors", ["vendors"]),
    ("Evidence", ["evidence"]),
    ("Integrations", ["integrations"]),
    ("Auth surfaces", ["(auth)", "sign-in", "sign-up"]),
]

LEGAL_HINTS = ["legal", "privacy", "terms", "dpa", "cookie", "cookies", "soukromi", "podminky"]
DRAFT_HINTS = ["draft", "not reviewed", "non verific", "nerevid", "bozza", "AI-generated draft", "AI draft"]
PLACEHOLDER_RE = re.compile(r"(\[[A-Z0-9_ -]{2,}\]|\{[A-Za-z0-9_.-]+\})")
WORD_RE = re.compile(r"[A-Za-zÀ-ž][A-Za-zÀ-ž0-9’'\-]*(?:\s+[A-Za-zÀ-ž0-9’'\-]+)*")

HARDCODED_ROOTS = [
    Path("lib/legal/legal-page-copy.ts"),
    Path("lib/marketing/framework-detail-copy.ts"),
    Path("lib/marketing/platform-copy.ts"),
    Path("lib/policies/ui-copy.ts"),
    Path("lib/trust-center/public-copy.ts"),
]
HARDCODED_GLOBS = [
    "app/(marketing)/**/*.tsx",
    "lib/marketing/*.ts",
    "lib/legal/*.ts",
    "lib/policies/*.ts",
    "lib/trust-center/*.ts",
    "lib/email/**/*.ts",
    "lib/*/notifications.ts",
    "lib/*/reminders.ts",
    "lib/vendors/*.ts",
    "lib/frameworks/*.ts",
    "lib/controls/*.ts",
    "lib/incidents/reporting.ts",
    "lib/risks/common.ts",
]

SKIP_VALUES = {
    "GET", "POST", "PUT", "PATCH", "DELETE", "use server", "use client",
    "auto", "manual", "draft", "approved", "flagged", "reviewed", "pass", "fail", "pending",
    "high", "medium", "low", "supported", "partial", "no-context", "openai", "json", "blob",
    "en-EU", "it-IT", "cs-CZ", "Europe/Prague", "Europe/Rome",
}
SKIP_SUBSTRINGS = [
    "@/", "http://", "https://", "mailto:", "tel:", "npm run", "OPENAI_", "CLERK_", "NEXT_",
    "DATABASE_URL", "className", "lucide", "px-", "py-", "text-", "bg-", "rounded", "border",
]

@dataclass
class Entry:
    key: str | None
    source: str | None
    context: str
    text: str
    flags: list[str]
    section: str
    subsection: str


def flatten(obj: Any, prefix: str = "") -> dict[str, str]:
    out: dict[str, str] = {}
    if isinstance(obj, dict):
        for key, value in obj.items():
            child = f"{prefix}.{key}" if prefix else str(key)
            out.update(flatten(value, child))
    elif isinstance(obj, list):
        for index, value in enumerate(obj):
            out.update(flatten(value, f"{prefix}[{index}]"))
    elif obj is None:
        out[prefix] = ""
    else:
        out[prefix] = str(obj)
    return out


def section_for_key(key: str) -> str:
    lowered = key.lower()
    root = re.split(r"[.\[]", key)[0]
    root_map = {
        "app": "Global / Shell",
        "navigation": "Global / Shell",
        "shell": "Global / Shell",
        "appError": "Errors and fallbacks",
        "authFallback": "Auth surfaces",
        "appDataNotice": "Errors and fallbacks",
        "billingSettings": "Settings",
        "frameworkWizard": "Frameworks",
        "dashboard": "Dashboard",
        "evidence": "Evidence",
        "frameworks": "Frameworks",
        "integrations": "Integrations",
        "incidents": "Incidents",
        "risks": "Risks",
        "clientsPage": "Team",
        "teamPage": "Team",
        "vendorsPage": "Vendors",
        "vendorAssessmentPage": "Vendors",
        "controlsPage": "Controls",
        "auditLogPage": "Settings",
        "clientDetailPage": "Team",
        "accessReviews": "Team",
        "trustCenterSettings": "Trust Center (app)",
        "marketing": "Marketing / Public site",
        "home": "Marketing / Public site",
        "leadCapture": "Marketing / Public site",
        "pricing": "Marketing / Public site",
        "regulations": "Marketing / Public site",
        "onboarding": "Onboarding",
        "organisationSettings": "Settings",
        "questionnairePage": "Questionnaires",
    }
    if root in root_map:
        return root_map[root]
    if "trustcenter" in lowered and any(x in lowered for x in ["public", "preview", "demo"]):
        return "Trust Center (public)"
    for section, hints in SECTION_KEY_HINTS:
        if any(hint.lower() in lowered for hint in hints):
            return section
    return "Miscellaneous"


def section_for_file(path: str) -> str:
    lowered = path.lower()
    for section, hints in SECTION_FILE_HINTS:
        if any(hint.lower() in lowered for hint in hints):
            return section
    return "Miscellaneous"


def subsection_for_key(key: str) -> str:
    first = re.split(r"[.\[]", key)[0]
    if len(key.split(".")) > 1:
        second = re.split(r"[.\[]", key)[1]
        return f"{first}.{second}"
    return first


def label_from_key(key: str) -> str:
    tail = re.split(r"[.\[]", key)[-1].replace("]", "")
    tail = re.sub(r"([a-z])([A-Z])", r"\1 \2", tail).replace("_", "-").replace("-", " ")
    return tail.lower() or "text"


def context_for_locale_key(key: str) -> str:
    section = section_for_key(key)
    label = label_from_key(key)
    return f"Text for the {section} surface; this string is used as the {label} copy for locale key `{key}`."


def flags_for(text: str, key_or_source: str, missing: list[str] | None = None, hardcoded: bool = False) -> list[str]:
    flags: list[str] = []
    if missing:
        flags.append(f"[MISSING IN OTHER LOCALES] Missing in {', '.join(missing)}")
    if PLACEHOLDER_RE.search(text):
        flags.append("[PLACEHOLDER — needs real value]")
    lowered = f"{key_or_source} {text}".lower()
    if any(h in lowered for h in LEGAL_HINTS):
        flags.append("[LEGAL COPY]")
    if hardcoded:
        flags.append("[HARDCODED]")
    if any(h.lower() in lowered for h in DRAFT_HINTS):
        flags.append("[DRAFT / NOT REVIEWED]")
    return flags


def md_escape_text(text: str) -> str:
    return text.replace("\r\n", "\n").replace("\r", "\n")


def load_locale_entries() -> tuple[dict[str, dict[str, str]], list[str]]:
    flats: dict[str, dict[str, str]] = {}
    for locale in LOCALES:
        path = Path("messages") / f"{locale}.json"
        flats[locale] = flatten(json.loads(path.read_text(encoding="utf-8")))
    all_keys = sorted(set().union(*(set(v.keys()) for v in flats.values())))
    return flats, all_keys


def is_probably_user_visible(value: str, prefix: str, suffix: str) -> bool:
    value = value.strip()
    if not value or value in SKIP_VALUES:
        return False
    if len(value) < 2:
        return False
    if any(s in value for s in SKIP_SUBSTRINGS):
        return False
    if re.fullmatch(r"[#./_A-Za-z0-9:-]+", value) and " " not in value and len(value) < 28:
        return False
    if re.fullmatch(r"[a-z0-9_.:/\-[\]{}]+", value):
        return False
    nearby = (prefix[-80:] + suffix[:80]).lower()
    if any(attr in nearby for attr in ["classname=", "href=", "src=", "import ", "from ", "metadata:"]):
        return False
    if not WORD_RE.search(value):
        return False
    # Drop single camel/lower identifiers; keep real labels like MFA, NIS2, GDPR and copy with spaces/punctuation.
    if " " not in value and len(value) < 16 and value.isidentifier() and not value.isupper():
        return False
    return True


def collect_hardcoded_files() -> list[Path]:
    files = set(p for p in HARDCODED_ROOTS if p.exists())
    for pattern in HARDCODED_GLOBS:
        files.update(Path(".").glob(pattern))
    return sorted(files)


def extract_string_literals(path: Path) -> list[tuple[int, str]]:
    text = path.read_text(encoding="utf-8")
    results: list[tuple[int, str]] = []
    patterns = [
        re.compile(r'"((?:\\.|[^"\\])*)"', re.S),
        re.compile(r"'((?:\\.|[^'\\])*)'", re.S),
        re.compile(r"`([^`$]*(?:\$\{[^}]*\}[^`$]*)*)`", re.S),
    ]
    seen = set()
    for pattern in patterns:
        for match in pattern.finditer(text):
            raw = match.group(1)
            prefix = text[:match.start()]
            suffix = text[match.end():]
            try:
                value = ast.literal_eval('"' + raw.replace('"', '\\"') + '"')
            except Exception:
                value = raw
            value = re.sub(r"\$\{[^}]+\}", "{value}", value)
            value = value.strip()
            if not is_probably_user_visible(value, prefix, suffix):
                continue
            line = text.count("\n", 0, match.start()) + 1
            dedupe = (line, value)
            if dedupe in seen:
                continue
            seen.add(dedupe)
            results.append((line, value))
    return results


def infer_locale_for_hardcoded(path: Path, line: int, text: str) -> str | None:
    # For locale-specific TS records, infer the active object key by the most recent
    # locale marker before the string. This avoids assigning Czech strings to the
    # following English block just because it is physically nearby.
    lines = path.read_text(encoding="utf-8").splitlines()
    before = "\n".join(lines[:line])
    matches: list[tuple[int, str]] = []
    for locale in LOCALES:
        for match in re.finditer(re.escape(locale), before):
            matches.append((match.start(), locale))
    if not matches:
        return None
    _, locale = max(matches, key=lambda item: item[0])
    # Only trust this for files that actually define multiple locale blocks.
    locale_count = sum(1 for candidate in LOCALES if candidate in "\n".join(lines))
    return locale if locale_count >= 2 else None


def context_for_hardcoded(path: Path, line: int) -> str:
    section = section_for_file(str(path))
    return f"Hardcoded user-visible copy in `{path}` near line {line}, shown on the {section} surface or supporting copy module."


def make_documents() -> dict[str, int]:
    flats, all_keys = load_locale_entries()
    entries: dict[str, list[Entry]] = {locale: [] for locale in LOCALES}

    for key in all_keys:
        present_in = [loc for loc in LOCALES if key in flats[loc]]
        for locale in LOCALES:
            missing_here = key not in flats[locale]
            text = flats[locale].get(key, "")
            missing_elsewhere = [loc for loc in LOCALES if loc != locale and key not in flats[loc]]
            flags = flags_for(text, key, missing_elsewhere if not missing_here else None)
            if missing_here:
                flags.insert(0, f"[MISSING] Present in {', '.join(present_in)}")
            entries[locale].append(Entry(
                key=key,
                source=None,
                context=context_for_locale_key(key),
                text=text,
                flags=flags,
                section=section_for_key(key),
                subsection=subsection_for_key(key),
            ))

    hardcoded_by_file: dict[str, int] = {}
    for path in collect_hardcoded_files():
        literals = extract_string_literals(path)
        if not literals:
            continue
        hardcoded_by_file[str(path)] = len(literals)
        for line, value in literals:
            inferred_locale = infer_locale_for_hardcoded(path, line, value)
            target_locales = [inferred_locale] if inferred_locale else list(LOCALES.keys())
            for locale in target_locales:
                entries[locale].append(Entry(
                    key=None,
                    source=f"{path}:{line}",
                    context=context_for_hardcoded(path, line),
                    text=value,
                    flags=flags_for(value, str(path), hardcoded=True),
                    section=section_for_file(str(path)),
                    subsection=str(path),
                ))

    out_dir = Path("docs/review")
    out_dir.mkdir(parents=True, exist_ok=True)
    for locale, meta in LOCALES.items():
        lines: list[str] = []
        lines.append(f"# {meta['title']}")
        lines.append(f"Language: {meta['language']}")
        lines.append(f"Source file: messages/{locale}.json + hardcoded sources")
        lines.append("Prepared for: specialist review")
        lines.append("Instructions for reviewer: Use the KEY or SOURCE reference exactly as written when returning corrections.")
        lines.append("")
        lines.append("---")
        lines.append("")
        lines.append("## How to use this document")
        lines.append("")
        lines.append("For each string below:")
        lines.append("- If the text is correct, write: OK")
        lines.append("- If the text needs a change, write the corrected version directly below the current text, prefixed with: CORRECTION:")
        lines.append("- If context is needed before deciding, write: QUERY: [your question]")
        lines.append("")
        lines.append("Return the completed document. Do not change the KEY or SOURCE lines — these are used to apply your corrections back to the app.")
        lines.append("")
        lines.append("---")
        by_section: dict[str, list[Entry]] = defaultdict(list)
        for entry in entries[locale]:
            by_section[entry.section].append(entry)
        for section in SECTION_ORDER:
            lines.append("")
            lines.append(f"## {section}")
            section_entries = by_section.get(section, [])
            if not section_entries:
                lines.append("")
                lines.append("No extracted strings for this section.")
                continue
            by_subsection: dict[str, list[Entry]] = defaultdict(list)
            for entry in section_entries:
                by_subsection[entry.subsection].append(entry)
            for subsection in sorted(by_subsection):
                lines.append("")
                lines.append(f"### {subsection}")
                for entry in by_subsection[subsection]:
                    lines.append("")
                    if entry.key:
                        lines.append(f"KEY: {entry.key}")
                    else:
                        lines.append(f"SOURCE: {entry.source}")
                    lines.append(f"CONTEXT: {entry.context}")
                    if entry.flags:
                        lines.append("FLAGS: " + "; ".join(entry.flags))
                    lines.append("TEXT:")
                    lines.append(md_escape_text(entry.text))
                    lines.append("")
                    lines.append("---")
        (out_dir / f"text-review-{locale}.md").write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8")

    # Summary
    placeholder_rows = []
    for locale, flat in flats.items():
        for key, value in sorted(flat.items()):
            if PLACEHOLDER_RE.search(value):
                placeholder_rows.append((locale, key, value))
    missing_rows = []
    for key in all_keys:
        present = [loc for loc in LOCALES if key in flats[loc]]
        missing = [loc for loc in LOCALES if key not in flats[loc]]
        if missing:
            missing_rows.append((key, present, missing))
    summary = [
        "# Text Review Extraction Summary — splnit.eu",
        "",
        "## Key count match",
        "",
    ]
    for locale in LOCALES:
        summary.append(f"- {locale}.json: {len(flats[locale])} keys extracted")
    summary.extend(["", "## Missing key report", ""])
    if missing_rows:
        for key, present, missing in missing_rows:
            summary.append(f"- Key `{key}` present in {', '.join(present)}, missing in {', '.join(missing)}")
    else:
        summary.append("- No missing locale keys found across en-EU, it-IT, and cs-CZ.")
    summary.extend(["", "## Placeholder report", ""])
    if placeholder_rows:
        for locale, key, value in placeholder_rows:
            found = ", ".join(sorted(set(PLACEHOLDER_RE.findall(value))))
            summary.append(f"- {locale} `{key}`: {found}")
    else:
        summary.append("- No placeholder tokens found.")
    summary.extend(["", "## Hardcoded string count", ""])
    total_hardcoded = sum(hardcoded_by_file.values())
    summary.append(f"- Total hardcoded strings found outside locale JSON files: {total_hardcoded}")
    if hardcoded_by_file:
        for path, count in sorted(hardcoded_by_file.items()):
            summary.append(f"- {path}: {count}")
    else:
        summary.append("- No hardcoded strings found in scanned sources.")
    summary.extend(["", "## Scanned hardcoded sources", ""])
    for path in collect_hardcoded_files():
        summary.append(f"- {path}")
    (out_dir / "text-review-summary.md").write_text("\n".join(summary).rstrip() + "\n", encoding="utf-8")
    return {locale: len([e for e in entries[locale] if e.key]) for locale in LOCALES}


if __name__ == "__main__":
    counts = make_documents()
    for locale, count in counts.items():
        print(f"{locale}: {count} locale keys written")
    print("Review documents written to docs/review/")
