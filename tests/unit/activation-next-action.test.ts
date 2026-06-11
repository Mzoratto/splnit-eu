import { describe, expect, it } from "vitest";
import { deriveActivationNextAction } from "@/lib/activation/next-action";

describe("deriveActivationNextAction", () => {
  it("asks for intake first", () => {
    const action = deriveActivationNextAction({ hasIntakeProfile: false });

    expect(action.stage).toBe("complete_intake");
    expect(action.href).toBe("/onboarding");
  });

  it("opens a supported workspace when one is recommended", () => {
    const action = deriveActivationNextAction({
      accountingPlatform: "pohoda",
      hasIntakeProfile: true,
      selectedTools: ["microsoft365"],
    });

    expect(action.stage).toBe("open_recommended_workspace");
    expect(action.href).toBe("/workspaces/pohoda");
  });

  it("recommends connecting the matched integration when not yet connected", () => {
    const action = deriveActivationNextAction({
      hasIntakeProfile: true,
      integrations: [],
      selectedTools: ["microsoft365"],
    });

    expect(action.stage).toBe("connect_recommended_integration");
    expect(action.href).toBe("/integrations/microsoft365");
  });

  it("skips the connect step when the integration is already connected", () => {
    const action = deriveActivationNextAction({
      hasIntakeProfile: true,
      integrations: [{ provider: "microsoft365", status: "connected" }],
      priorityControls: [{ evidenceCount: 0, key: "ac-1" }],
      selectedTools: ["microsoft365"],
    });

    expect(action.stage).toBe("upload_first_evidence");
    expect(action.href).toBe("/controls/ac-1");
    expect(action.topPriorityControlKey).toBe("ac-1");
  });

  it("asks for review when the top control has evidence but needs a human", () => {
    const action = deriveActivationNextAction({
      hasIntakeProfile: true,
      integrations: [{ provider: "microsoft365", status: "connected" }],
      priorityControls: [{ evidenceCount: 2, key: "ac-1", status: "manual_review" }],
      selectedTools: ["microsoft365"],
    });

    expect(action.stage).toBe("review_first_gap");
  });

  it("moves to active monitoring when priority controls are progressing", () => {
    const action = deriveActivationNextAction({
      hasIntakeProfile: true,
      integrations: [{ provider: "microsoft365", status: "connected" }],
      priorityControls: [{ evidenceCount: 2, key: "ac-1", status: "pass" }],
      selectedTools: ["microsoft365"],
    });

    expect(action.stage).toBe("active_monitoring");
    expect(action.href).toBe("/controls?scope=priority");
  });

  it("falls back to reviewing ranked gaps when nothing is available", () => {
    const action = deriveActivationNextAction({
      hasIntakeProfile: true,
      integrations: [{ provider: "microsoft365", status: "connected" }],
      priorityControls: [],
      selectedTools: ["microsoft365"],
    });

    expect(action.stage).toBe("review_ranked_gaps");
    expect(action.topPriorityControlKey).toBeNull();
  });
});
