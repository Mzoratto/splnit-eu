export type AgencyInviteType = "client" | "consultant";

export type AgencyInviteSelection<TClientInvite, TConsultantInvite> =
  | {
      invite: TClientInvite;
      inviteType: "client";
      status: "selected";
    }
  | {
      invite: TConsultantInvite;
      inviteType: "consultant";
      status: "selected";
    }
  | {
      invite: null;
      inviteType: null;
      status: "ambiguous" | "not_found";
    };

export function selectAgencyInvite<TClientInvite, TConsultantInvite>(
  clientInvite: TClientInvite | null,
  consultantInvite: TConsultantInvite | null,
): AgencyInviteSelection<TClientInvite, TConsultantInvite> {
  if (clientInvite && consultantInvite) {
    return {
      invite: null,
      inviteType: null,
      status: "ambiguous",
    };
  }

  if (clientInvite) {
    return {
      invite: clientInvite,
      inviteType: "client",
      status: "selected",
    };
  }

  if (consultantInvite) {
    return {
      invite: consultantInvite,
      inviteType: "consultant",
      status: "selected",
    };
  }

  return {
    invite: null,
    inviteType: null,
    status: "not_found",
  };
}
