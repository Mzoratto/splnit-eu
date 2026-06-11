import { describe, expect, it } from "vitest";
import csMessages from "@/messages/cs-CZ.json";
import enMessages from "@/messages/en-EU.json";
import itMessages from "@/messages/it-IT.json";
import { CONTROL_LIBRARY } from "@/lib/controls/library";
import {
  computeVboNCoverage,
  groupVboNCoverage,
  summarizeVboNCoverage,
} from "@/lib/regulations/vbo-n/coverage";
import {
  getBaselineRefsForControl,
  VBO_N_CONTROL_MAPPINGS,
} from "@/lib/regulations/vbo-n/mapping";
import { isVboNBaselineId, VBO_N_CONTROLS } from "@/lib/regulations/vbo-n/spec";

const FORBIDDEN_PHRASES = ["soulad zaručen", "certifikováno NÚKIB", "jste v souladu"];

describe("VBO-N spec integrity", () => {
  it("contains exactly 47 controls with unique ids", () => {
    expect(VBO_N_CONTROLS).toHaveLength(47);
    expect(new Set(VBO_N_CONTROLS.map((control) => control.id)).size).toBe(47);
  });

  it("splits 22 neopominutelné / 25 vyhodnotitelné", () => {
    const tiers = VBO_N_CONTROLS.reduce<Record<string, number>>((acc, control) => {
      acc[control.tier] = (acc[control.tier] ?? 0) + 1;
      return acc;
    }, {});

    expect(tiers["neopominutelné"]).toBe(22);
    expect(tiers["vyhodnotitelné"]).toBe(25);
  });

  it("has a non-empty legal ref on every control", () => {
    for (const control of VBO_N_CONTROLS) {
      expect(control.ref.trim().length, control.id).toBeGreaterThan(0);
    }
  });
});

describe("VBO-N mapping validity", () => {
  it("maps only to existing control-library keys", () => {
    const libraryKeys = new Set(CONTROL_LIBRARY.map((control) => control.key));

    for (const mapping of VBO_N_CONTROL_MAPPINGS) {
      expect(libraryKeys.has(mapping.controlKey), mapping.controlKey).toBe(true);
    }
  });

  it("maps only to existing baseline ids", () => {
    for (const mapping of VBO_N_CONTROL_MAPPINGS) {
      expect(isVboNBaselineId(mapping.baselineId), mapping.baselineId).toBe(true);
    }
  });

  it("decorates CONTROL_LIBRARY seeds with baselineRefs from the mapping", () => {
    const mfa = CONTROL_LIBRARY.find((control) => control.key === "ctrl_mfa_all_users");
    expect(mfa?.baselineRefs).toEqual(["V-8-02"]);

    expect(getBaselineRefsForControl("ctrl_password_policy").sort()).toEqual(
      ["N-5-02", "V-8-01", "V-8-02"].sort(),
    );

    const unmapped = CONTROL_LIBRARY.find((control) => control.key === "ctrl_dpia_process");
    expect(unmapped?.baselineRefs).toBeUndefined();
  });

  it("leaves the reviewed gap ids unmapped", () => {
    const mappedIds = new Set(VBO_N_CONTROL_MAPPINGS.map((mapping) => mapping.baselineId));

    for (const gapId of [
      "N-3.1-01",
      "N-4-02",
      "N-4-03",
      "N-4-05",
      "N-4-06",
      "N-10-05",
      "V-8-03",
      "V-9-01",
      "V-9-03",
      "V-13-02",
    ]) {
      expect(mappedIds.has(gapId), gapId).toBe(false);
    }
  });
});

describe("VBO-N coverage semantics (confirmed rules)", () => {
  it("always returns all 47 baseline ids", () => {
    const items = computeVboNCoverage({ statusesByControlKey: {} });
    expect(items).toHaveLength(47);
    expect(summarizeVboNCoverage(items).total).toBe(47);
  });

  it("reports covered only when all mappings are direct and all statuses pass", () => {
    // V-7-05 has a single direct mapping: ctrl_offboarding_access_revoked
    const items = computeVboNCoverage({
      statusesByControlKey: { ctrl_offboarding_access_revoked: "pass" },
    });
    expect(items.find((item) => item.id === "V-7-05")?.coverage).toBe("covered");

    // V-12-03 has two direct mappings; only one passing -> partial
    const partialItems = computeVboNCoverage({
      statusesByControlKey: { ctrl_vulnerability_management: "pass" },
    });
    expect(partialItems.find((item) => item.id === "V-12-03")?.coverage).toBe("partial");
  });

  it("caps any partial-fit mapping at partial even when statuses pass", () => {
    // N-3.1-03 maps only ctrl_media_disposal with fit partial
    const items = computeVboNCoverage({
      statusesByControlKey: { ctrl_media_disposal: "pass" },
    });
    expect(items.find((item) => item.id === "N-3.1-03")?.coverage).toBe("partial");
  });

  it("treats mapped controls without status rows as not passing", () => {
    const items = computeVboNCoverage({ statusesByControlKey: {} });
    expect(items.find((item) => item.id === "V-7-05")?.coverage).toBe("partial");
  });

  it("reports unmapped ids as missing", () => {
    const items = computeVboNCoverage({ statusesByControlKey: {} });
    for (const gapId of ["N-3.1-01", "N-4-03", "N-4-05", "N-10-05", "V-8-03"]) {
      expect(items.find((item) => item.id === gapId)?.coverage, gapId).toBe("missing");
    }
  });

  it("lets record overrides mark an id covered (A3 hook)", () => {
    const items = computeVboNCoverage({
      recordOverrides: { "N-4-06": true },
      statusesByControlKey: {},
    });
    expect(items.find((item) => item.id === "N-4-06")?.coverage).toBe("covered");
  });

  it("groups by tier then area preserving spec order", () => {
    const grouped = groupVboNCoverage(computeVboNCoverage({ statusesByControlKey: {} }));
    expect(grouped.map((group) => group.tier)).toEqual([
      "neopominutelné",
      "vyhodnotitelné",
    ]);
    expect(grouped[0].areas[0].area).toBe("Systém zajišťování minimální KB");
  });
});

describe("VBO-N i18n and honesty rules", () => {
  it("has vboN keys in all three locales", () => {
    for (const messages of [csMessages, enMessages, itMessages]) {
      expect(messages.vboN.title).toBeTruthy();
      expect(messages.vboN.coverage.missing).toBeTruthy();
      expect(messages.vboN.frameworksCard.open).toBeTruthy();
    }
  });

  it("contains no forbidden compliance-guarantee phrases", () => {
    const serialized = JSON.stringify([
      csMessages.vboN,
      enMessages.vboN,
      itMessages.vboN,
    ]).toLowerCase();

    for (const phrase of FORBIDDEN_PHRASES) {
      expect(serialized.includes(phrase.toLowerCase()), phrase).toBe(false);
    }
  });
});
