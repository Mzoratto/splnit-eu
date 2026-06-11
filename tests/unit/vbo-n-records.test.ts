import { describe, expect, it } from "vitest";
import { computeVboNCoverage } from "@/lib/regulations/vbo-n/coverage";
import {
  computeVboNRecordOverrides,
  hasQualificationEvidence,
  isTrainingStale,
} from "@/lib/regulations/vbo-n/records";

const NOW = new Date("2026-06-11T00:00:00Z");

describe("vrcholné vedení record rules", () => {
  it("N-4-01 flips only with qualification evidence", () => {
    const withoutEvidence = computeVboNRecordOverrides(
      {
        recovery: { approvedOn: null, priorityCount: 0 },
        responsiblePersons: [
          { name: "Jan Novák", qualificationFileUrl: null, qualificationNote: null },
        ],
        trainings: [],
      },
      NOW,
    );
    expect(withoutEvidence["N-4-01"]).toBeUndefined();

    const withNote = computeVboNRecordOverrides(
      {
        recovery: { approvedOn: null, priorityCount: 0 },
        responsiblePersons: [
          {
            name: "Jan Novák",
            qualificationFileUrl: null,
            qualificationNote: "Kurz NÚKIB pro pověřené osoby, 2026",
          },
        ],
        trainings: [],
      },
      NOW,
    );
    expect(withNote["N-4-01"]).toBe(true);

    expect(
      hasQualificationEvidence({
        name: "X",
        qualificationFileUrl: "https://blob/certificate.pdf",
        qualificationNote: null,
      }),
    ).toBe(true);
  });

  it("N-4-02 requires every member trained within 12 months incl. initial training", () => {
    const allFresh = computeVboNRecordOverrides(
      {
        recovery: { approvedOn: null, priorityCount: 0 },
        responsiblePersons: [],
        trainings: [
          {
            initialTrainingOn: "2025-01-10",
            lastRegularTrainingOn: "2026-01-10",
            memberName: "A",
          },
          {
            initialTrainingOn: "2026-02-01",
            lastRegularTrainingOn: "2026-02-01",
            memberName: "B",
          },
        ],
      },
      NOW,
    );
    expect(allFresh["N-4-02"]).toBe(true);

    const oneStale = computeVboNRecordOverrides(
      {
        recovery: { approvedOn: null, priorityCount: 0 },
        responsiblePersons: [],
        trainings: [
          {
            initialTrainingOn: "2025-01-10",
            lastRegularTrainingOn: "2026-01-10",
            memberName: "A",
          },
          {
            initialTrainingOn: "2024-01-10",
            lastRegularTrainingOn: "2025-03-01",
            memberName: "B",
          },
        ],
      },
      NOW,
    );
    expect(oneStale["N-4-02"]).toBeUndefined();

    const missingInitial = computeVboNRecordOverrides(
      {
        recovery: { approvedOn: null, priorityCount: 0 },
        responsiblePersons: [],
        trainings: [
          {
            initialTrainingOn: null,
            lastRegularTrainingOn: "2026-05-01",
            memberName: "A",
          },
        ],
      },
      NOW,
    );
    expect(missingInitial["N-4-02"]).toBeUndefined();

    const noMembers = computeVboNRecordOverrides(
      {
        recovery: { approvedOn: null, priorityCount: 0 },
        responsiblePersons: [],
        trainings: [],
      },
      NOW,
    );
    expect(noMembers["N-4-02"]).toBeUndefined();
  });

  it("N-4-06 requires priorities plus the approval date", () => {
    expect(
      computeVboNRecordOverrides(
        {
          recovery: { approvedOn: null, priorityCount: 3 },
          responsiblePersons: [],
          trainings: [],
        },
        NOW,
      )["N-4-06"],
    ).toBeUndefined();

    expect(
      computeVboNRecordOverrides(
        {
          recovery: { approvedOn: "2026-05-01", priorityCount: 3 },
          responsiblePersons: [],
          trainings: [],
        },
        NOW,
      )["N-4-06"],
    ).toBe(true);
  });

  it("never defines rules for N-4-03, N-4-04, N-4-05 (confirmed gaps/mapping)", () => {
    const overrides = computeVboNRecordOverrides(
      {
        recovery: { approvedOn: "2026-05-01", priorityCount: 3 },
        responsiblePersons: [
          { name: "X", qualificationFileUrl: null, qualificationNote: "ok" },
        ],
        trainings: [
          {
            initialTrainingOn: "2026-01-01",
            lastRegularTrainingOn: "2026-01-01",
            memberName: "A",
          },
        ],
      },
      NOW,
    );

    expect(Object.keys(overrides).sort()).toEqual(["N-4-01", "N-4-02", "N-4-06"]);
  });

  it("flips A1 coverage statuses end to end (acceptance)", () => {
    const before = computeVboNCoverage({ statusesByControlKey: {} });
    expect(before.find((item) => item.id === "N-4-02")?.coverage).toBe("missing");
    expect(before.find((item) => item.id === "N-4-06")?.coverage).toBe("missing");

    const overrides = computeVboNRecordOverrides(
      {
        recovery: { approvedOn: "2026-05-01", priorityCount: 2 },
        responsiblePersons: [
          { name: "X", qualificationFileUrl: null, qualificationNote: "kurz" },
        ],
        trainings: [
          {
            initialTrainingOn: "2026-01-01",
            lastRegularTrainingOn: "2026-01-01",
            memberName: "A",
          },
        ],
      },
      NOW,
    );
    const after = computeVboNCoverage({
      recordOverrides: overrides,
      statusesByControlKey: {},
    });

    expect(after.find((item) => item.id === "N-4-01")?.coverage).toBe("covered");
    expect(after.find((item) => item.id === "N-4-02")?.coverage).toBe("covered");
    expect(after.find((item) => item.id === "N-4-06")?.coverage).toBe("covered");
    // Confirmed gaps stay missing regardless of records.
    expect(after.find((item) => item.id === "N-4-03")?.coverage).toBe("missing");
    expect(after.find((item) => item.id === "N-4-05")?.coverage).toBe("missing");
  });

  it("training staleness honours the configurable reminder window", () => {
    expect(isTrainingStale("2025-05-01", NOW)).toBe(true);
    expect(isTrainingStale("2025-08-01", NOW)).toBe(false);
    expect(isTrainingStale(null, NOW)).toBe(true);
    // configurable: 6-month window flags an 8-month-old training
    expect(isTrainingStale("2025-10-01", NOW, 6)).toBe(true);
  });
});
