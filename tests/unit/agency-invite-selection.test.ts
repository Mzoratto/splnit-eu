import { describe, expect, it } from "vitest";
import { selectAgencyInvite } from "@/lib/agency/invite-selection";

describe("selectAgencyInvite", () => {
  const clientInvite = { id: "client-invite" };
  const consultantInvite = { id: "consultant-invite" };

  it("selects the client invite when only it matches", () => {
    expect(selectAgencyInvite(clientInvite, null)).toEqual({
      invite: clientInvite,
      inviteType: "client",
      status: "selected",
    });
  });

  it("selects the consultant invite when only it matches", () => {
    expect(selectAgencyInvite(null, consultantInvite)).toEqual({
      invite: consultantInvite,
      inviteType: "consultant",
      status: "selected",
    });
  });

  it("flags ambiguous tokens that match both invite types", () => {
    expect(selectAgencyInvite(clientInvite, consultantInvite)).toEqual({
      invite: null,
      inviteType: null,
      status: "ambiguous",
    });
  });

  it("reports not_found when neither invite matches", () => {
    expect(selectAgencyInvite(null, null)).toEqual({
      invite: null,
      inviteType: null,
      status: "not_found",
    });
  });
});
