// All demo data for Kovarna Novak s.r.o.
// Zero imports from DB, Clerk, or any async source.
// Everything is plain TypeScript objects.

export const DEMO_ORG = {
  id: "demo-org-kovarnak",
  name: "Kovárna Novák s.r.o.",
  sector: "Výroba kovových výrobků",
  employees: 45,
  ico: "28841234",
  registeredAt: "2026-02-15",
  complianceDeadline: "2027-02-15",
  daysUntilDeadline: 271,
  locale: "cs-CZ",
  tools: ["Pohoda", "Hetzner Cloud", "Microsoft 365"],
  nukibRegisteredAtLabel: "únor 2026",
  complianceDeadlineLabel: "únor 2027",
} as const;

export const DEMO_SCORE = {
  overall: 38,
  mandatoryComplete: 2,
  mandatoryTotal: 5,
  assessableComplete: 2,
  assessableTotal: 5,
  openGaps: 6,
  criticalGaps: 3,
} as const;

export type DemoControlStatus = "pass" | "gap" | "fail" | "pending";

export interface DemoControl {
  controlKey: string;
  title: string;
  reference: string;
  tier: "mandatory_minimum" | "assessable";
  status: DemoControlStatus;
  evidenceSummary: string;
  source: "api" | "manual" | "gap";
  sourceLabel?: string;
}

export const DEMO_CONTROLS: DemoControl[] = [
  {
    controlKey: "§4-poverena-osoba",
    title: "Pověřená osoba kybernetické bezpečnosti",
    reference: "§ 4",
    tier: "mandatory_minimum",
    status: "pass",
    evidenceSummary:
      "Jan Novák — jmenován 15. 2. 2026, školení NÚKIB absolvováno 20. 2. 2026",
    source: "manual",
  },
  {
    controlKey: "pohoda-backup-dr",
    title: "Zálohy databáze Pohoda",
    reference: "§ 6",
    tier: "mandatory_minimum",
    status: "fail",
    evidenceSummary:
      "Záloha databáze není nakonfigurována — vysoké riziko ztráty dat",
    source: "gap",
  },
  {
    controlKey: "hetzner-snapshot",
    title: "Zálohy serverů Hetzner Cloud",
    reference: "§ 6",
    tier: "mandatory_minimum",
    status: "pass",
    evidenceSummary:
      "Snapshot ověřen automaticky — poslední záloha 21. 5. 2026",
    source: "api",
    sourceLabel: "Ověřeno automaticky — Hetzner",
  },
  {
    controlKey: "§5-skoleni",
    title: "Školení zaměstnanců v kybernetické bezpečnosti",
    reference: "§ 5",
    tier: "mandatory_minimum",
    status: "gap",
    evidenceSummary:
      "3 ze 45 zaměstnanců nepodstoupili povinné vstupní školení",
    source: "gap",
  },
  {
    controlKey: "§3-bezpecnostni-politika",
    title: "Bezpečnostní politika a dokumentace",
    reference: "§ 3",
    tier: "mandatory_minimum",
    status: "fail",
    evidenceSummary: "Bezpečnostní politika nebyla vytvořena",
    source: "gap",
  },
  {
    controlKey: "§10-incidenty",
    title: "Řešení kybernetických bezpečnostních incidentů",
    reference: "§ 10",
    tier: "mandatory_minimum",
    status: "fail",
    evidenceSummary: "Žádný zdokumentovaný postup pro řešení incidentů",
    source: "gap",
  },
  {
    controlKey: "m365-mfa",
    title: "Vícefaktorové ověřování (Microsoft 365)",
    reference: "§ 8",
    tier: "assessable",
    status: "gap",
    evidenceSummary: "MFA aktivní pro 28 z 45 účtů — 17 účtů bez ochrany",
    source: "gap",
  },
  {
    controlKey: "§7-rizeni-pristupu",
    title: "Řízení přístupu a deaktivace účtů",
    reference: "§ 7",
    tier: "assessable",
    status: "gap",
    evidenceSummary: "2 účty odcházejících zaměstnanců nebyly deaktivovány",
    source: "gap",
  },
  {
    controlKey: "hetzner-firewall",
    title: "Bezpečnost komunikačních sítí — Hetzner firewall",
    reference: "§ 11",
    tier: "assessable",
    status: "pass",
    evidenceSummary: "Firewall ověřen automaticky — 3 pravidla aktivní",
    source: "api",
    sourceLabel: "Ověřeno automaticky — Hetzner",
  },
  {
    controlKey: "§9-detekce",
    title: "Detekce kybernetických bezpečnostních událostí",
    reference: "§ 9",
    tier: "assessable",
    status: "fail",
    evidenceSummary: "Žádné nástroje pro detekci bezpečnostních událostí",
    source: "gap",
  },
];

export const DEMO_PRIORITY_GAPS = DEMO_CONTROLS.filter(
  (control) => control.status === "fail" || control.status === "gap",
).slice(0, 4);

export const DEMO_POHODA_LAYERS = [
  {
    id: "infrastructure",
    title: "Infrastruktura a zabezpečení úložiště",
    completionPct: 0.5,
    completedControls: 1,
    totalControls: 2,
  },
  {
    id: "iam",
    title: "Řízení přístupu a správa identit",
    completionPct: 0,
    completedControls: 0,
    totalControls: 2,
  },
  {
    id: "backup_dr",
    title: "Zálohy a obnova po havárii",
    completionPct: 0,
    completedControls: 0,
    totalControls: 3,
  },
  {
    id: "api_connectivity",
    title: "Zabezpečení API a propojení",
    completionPct: 1,
    completedControls: 1,
    totalControls: 1,
  },
] as const;

export const DEMO_POHODA_OPEN_ATTESTATION = {
  controlKey: "pohoda-backup-automated-daily",
  title: "Zálohy databáze Pohoda",
  status: "fail" as const,
  summary: "Automatická záloha databáze zatím není nakonfigurována.",
} as const;

export const DEMO_HETZNER_EVIDENCE = [
  {
    controlKey: "hetzner-infra-server-running",
    label: "Server",
    name: "demo-server-01",
    detail: "Running — CX22",
    verifiedAt: "21. 5. 2026",
  },
  {
    controlKey: "hetzner-infra-firewall-present",
    label: "Firewall",
    name: "demo-firewall",
    detail: "3 pravidla aktivní",
    verifiedAt: "21. 5. 2026",
  },
  {
    controlKey: "hetzner-infra-snapshot-recent",
    label: "Snapshot",
    name: "demo-snapshot",
    detail: "21. 5. 2026 (0 dní zpět)",
    verifiedAt: "21. 5. 2026",
  },
] as const;

export const DEMO_EXPORT = {
  title: "Přehled bezpečnostních opatření",
  subtitle:
    "Přehled bezpečnostních opatření dle § 3 odst. 2 vyhl. č. 410/2025 Sb.",
  generatedAtLabel: "22. 5. 2026",
} as const;

// TODO: Add en-EU and it-IT demo content variants after Czech launch copy is stable.
