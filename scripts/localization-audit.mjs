import fs from 'node:fs';

const locales = ['en-EU', 'it-IT', 'cs-CZ'];
const messages = Object.fromEntries(locales.map((locale) => [
  locale,
  JSON.parse(fs.readFileSync(`messages/${locale}.json`, 'utf8')),
]));

function flatten(value, prefix = '') {
  if (Array.isArray(value)) {
    return Object.assign({}, ...value.map((item, index) => flatten(item, `${prefix}[${index}]`)));
  }
  if (value && typeof value === 'object') {
    return Object.assign({}, ...Object.entries(value).map(([key, item]) => flatten(item, prefix ? `${prefix}.${key}` : key)));
  }
  return { [prefix]: String(value) };
}

const flat = Object.fromEntries(locales.map((locale) => [locale, flatten(messages[locale])]));
const allKeys = new Set(Object.values(flat).flatMap((obj) => Object.keys(obj)));
const placeholderRe = /\{[^{}]+\}/g;
const asciiItalianRe = /\b(?:autorita'|responsabilita'|vulnerabilita'|attivita'|liberta'|perche'|poiche'|puo'|citta'|qualita'|conformita'|priorita'|modalita'|societa'|realta'|continuita'|capacita'|validita'|identita'|disponibilita'|necessita'|proprieta'|criticita'|verra'|sara'|piu'|e')\b/i;
const suspiciousEnglishInIt = /\b(?:readiness|evidence|policy|policies|dashboard|workspace|upgrade|baseline|security posture|vendor risk|trust center|last assessed|download|generate|review|priority gaps|scope|out of scope|not applicable|reason from intake|verified|pending|failed|passed|documents|control categories|framework status|regulation context)\b/i;
const suspiciousEnglishInCs = /\b(?:readiness|evidence|policy|policies|dashboard|workspace|upgrade|baseline|security posture|vendor risk|last assessed|download|generate|review|priority gaps|scope|out of scope|not applicable|reason from intake|verified|pending|failed|passed|documents|control categories|framework status|regulation context)\b/i;
const czechLeaksInIt = /\b(?:NÚKIB|NUKIB|ÚOOÚ|UOOU|ARES|zákon č\.|Sb\.|vyhláška|ČTÚ)\b/i;
const riskyPlaceholders = /before production launch|must be completed|deve essere completat|musí být dopln|TODO|FIXME|lorem ipsum/i;

const findings = [];

for (const locale of locales) {
  const missing = [...allKeys].filter((key) => !(key in flat[locale])).sort();
  if (missing.length) findings.push({ severity: 'P0', type: 'missing-keys', locale, count: missing.length, sample: missing.slice(0, 20) });
}

for (const key of [...allKeys].sort()) {
  const placeholders = Object.fromEntries(locales.map((locale) => [locale, [...new Set(flat[locale]?.[key]?.match(placeholderRe) ?? [])].sort()]));
  if (new Set(Object.values(placeholders).map((v) => JSON.stringify(v))).size > 1) {
    findings.push({ severity: 'P0', type: 'placeholder-mismatch', key, placeholders });
  }
}

for (const [key, value] of Object.entries(flat['it-IT']).sort()) {
  if (asciiItalianRe.test(value)) findings.push({ severity: 'P2', type: 'italian-ascii-accent', key, value });
  if (czechLeaksInIt.test(value)) findings.push({ severity: 'P0', type: 'italian-czech-leak', key, value });
  if (riskyPlaceholders.test(value)) findings.push({ severity: 'P0', type: 'italian-placeholder-risk', key, value });
  if (suspiciousEnglishInIt.test(value)) findings.push({ severity: 'P2', type: 'italian-possible-english-leak', key, value });
}

for (const [key, value] of Object.entries(flat['cs-CZ']).sort()) {
  if (riskyPlaceholders.test(value)) findings.push({ severity: 'P0', type: 'czech-placeholder-risk', key, value });
  if (suspiciousEnglishInCs.test(value)) findings.push({ severity: 'P2', type: 'czech-possible-english-leak', key, value });
}

for (const [key, en] of Object.entries(flat['en-EU']).sort()) {
  const it = flat['it-IT'][key] ?? '';
  const cs = flat['cs-CZ'][key] ?? '';
  const enHas = (re) => re.test(en);
  if (enHas(/advisor|review|counsel|audit|draft|indicative|not legal advice/i)) {
    if (!/(revis|consulent|legale|bozza|indicativ|audit|parere legale|consulente)/i.test(it)) {
      findings.push({ severity: 'P1', type: 'it-may-miss-review-boundary', key, en, it });
    }
    if (!/(reviz|poradc|práv|návrh|orienta|audit|konzult)/i.test(cs)) {
      findings.push({ severity: 'P1', type: 'cs-may-miss-review-boundary', key, en, cs });
    }
  }
}

console.log(JSON.stringify({
  keyCounts: Object.fromEntries(locales.map((locale) => [locale, Object.keys(flat[locale]).length])),
  missingOrExtra: locales.map((locale) => ({ locale, missing: [...allKeys].filter((key) => !(key in flat[locale])).length })),
  findings: findings.slice(0, 300),
  findingCounts: findings.reduce((acc, f) => { acc[f.type] = (acc[f.type] || 0) + 1; return acc; }, {}),
}, null, 2));
