import { describe, expect, it } from "vitest";
import { REVIEW_DISCLAIMER } from "@/lib/export/constants";
import {
  renderPrehledTemplate,
  type PrehledSnapshotEntry,
} from "@/lib/export/prehled-template";
import {
  getAllowedPrehledStatuses,
  isPrehledVersionStale,
  validatePrehledEntry,
} from "@/lib/regulations/vbo-n/prehled";
import { VBO_N_CONTROLS } from "@/lib/regulations/vbo-n/spec";

const FORBIDDEN_PHRASES = ["soulad zaručen", "certifikováno NÚKIB", "jste v souladu"];

// N-3.1-01 is neopominutelné; V-7-01 is vyhodnotitelné (asserted below).
describe("prehled entry validation", () => {
  it("requires popis zavedení for zavedeno", () => {
    expect(
      validatePrehledEntry({ baselineId: "V-7-01", status: "zavedeno" }).ok,
    ).toBe(false);
    expect(
      validatePrehledEntry({
        baselineId: "V-7-01",
        implementationNote: "Účty řízeny v Entra ID, oddělené admin účty.",
        status: "zavedeno",
      }).ok,
    ).toBe(true);
  });

  it("requires termín, priorita, and odpovědná osoba for planovano", () => {
    const missing = validatePrehledEntry({
      baselineId: "V-7-01",
      plannedDate: "2026-09-30",
      status: "planovano",
    });
    expect(missing.ok).toBe(false);

    expect(
      validatePrehledEntry({
        baselineId: "V-7-01",
        plannedDate: "2026-09-30",
        priority: "vysoka",
        responsiblePerson: "Jana Nováková",
        status: "planovano",
      }).ok,
    ).toBe(true);
  });

  it("rejects invalid priorities", () => {
    expect(
      validatePrehledEntry({
        baselineId: "V-7-01",
        plannedDate: "2026-09-30",
        priority: "urgent",
        responsiblePerson: "Jana Nováková",
        status: "planovano",
      }).ok,
    ).toBe(false);
  });

  it("never allows nezavedeno for neopominutelné controls", () => {
    const neopominutelne = VBO_N_CONTROLS.filter(
      (control) => control.tier === "neopominutelné",
    );
    expect(neopominutelne.length).toBe(22);

    for (const control of neopominutelne) {
      const result = validatePrehledEntry({
        baselineId: control.id,
        justification: "Detailní odůvodnění.",
        status: "nezavedeno",
      });
      expect(result.ok, control.id).toBe(false);
    }
  });

  it("allows nezavedeno for vyhodnotitelné controls only with odůvodnění", () => {
    expect(
      validatePrehledEntry({ baselineId: "V-7-01", status: "nezavedeno" }).ok,
    ).toBe(false);
    expect(
      validatePrehledEntry({
        baselineId: "V-7-01",
        justification: "Aktiva jsou plně v cloudu, fyzický perimetr nevlastníme.",
        status: "nezavedeno",
      }).ok,
    ).toBe(true);
  });

  it("rejects unknown baseline ids and statuses", () => {
    expect(validatePrehledEntry({ baselineId: "X-1-99", status: "zavedeno" }).ok).toBe(false);
    expect(validatePrehledEntry({ baselineId: "V-7-01", status: "hotovo" }).ok).toBe(false);
  });

  it("offers nezavedeno only to vyhodnotitelné controls in the UI", () => {
    expect(getAllowedPrehledStatuses("N-3.1-01")).toEqual(["zavedeno", "planovano"]);
    expect(getAllowedPrehledStatuses("V-7-01")).toContain("nezavedeno");
  });
});

describe("annual review staleness", () => {
  it("flags versions older than 11 months", () => {
    const now = new Date("2026-06-11T00:00:00Z");
    expect(isPrehledVersionStale(new Date("2025-06-01T00:00:00Z"), now)).toBe(true);
    expect(isPrehledVersionStale(new Date("2026-01-01T00:00:00Z"), now)).toBe(false);
    expect(isPrehledVersionStale(null, now)).toBe(false);
  });
});

describe("prehled export template", () => {
  const entries: PrehledSnapshotEntry[] = [
    {
      baselineId: "N-3.1-01",
      implementationNote: "Přehled veden v aplikaci, verze archivovány.",
      justification: null,
      plannedDate: null,
      priority: null,
      responsiblePerson: null,
      status: "zavedeno",
    },
    {
      baselineId: "V-7-01",
      implementationNote: null,
      justification: "Aktiva plně v cloudu, vlastní perimetr neexistuje.",
      plannedDate: null,
      priority: null,
      responsiblePerson: null,
      status: "nezavedeno",
    },
  ];

  const html = renderPrehledTemplate({
    entries,
    generatedAt: new Date("2026-06-11T10:00:00Z"),
    ico: "12345678",
    organisationName: "Testovací s.r.o.",
    versionNumber: 3,
  });

  it("renders header with organizace, datum, and verze", () => {
    expect(html).toContain("Testovací s.r.o.");
    expect(html).toContain("IČO 12345678");
    expect(html).toContain("Verze dokumentu:</strong> 3");
    expect(html).toContain("Přehled bezpečnostních opatření");
  });

  it("renders the review disclaimer in the footer", () => {
    expect(html).toContain("Tento dokument je návrh vygenerovaný s podporou AI");
    expect(REVIEW_DISCLAIMER).toContain("Nenahrazuje právní poradenství.");
  });

  it("renders odůvodnění for nezavedeno entries", () => {
    expect(html).toContain("Odůvodnění:");
    expect(html).toContain("Aktiva plně v cloudu, vlastní perimetr neexistuje.");
  });

  it("includes all 47 controls with legal refs from the spec only", () => {
    for (const control of VBO_N_CONTROLS) {
      expect(html, control.id).toContain(control.id);
    }
    expect(html).toContain("§ 3 odst. 2 VBO-N");
  });

  it("contains no forbidden compliance-guarantee phrases", () => {
    const lower = html.toLowerCase();
    for (const phrase of FORBIDDEN_PHRASES) {
      expect(lower.includes(phrase.toLowerCase()), phrase).toBe(false);
    }
  });
});
