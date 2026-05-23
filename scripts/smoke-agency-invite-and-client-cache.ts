import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { selectAgencyInvite } from "../lib/agency/invite-selection";

const future = new Date(Date.now() + 86_400_000);

function invite(status: string = "pending") {
  return {
    agency: {
      name: "Splnit Advisors",
    },
    invite: {
      expiresAt: future,
      status,
    },
  };
}

const clientInvite = invite();
const consultantInvite = invite();

assert.deepEqual(selectAgencyInvite(clientInvite, null), {
  invite: clientInvite,
  inviteType: "client",
  status: "selected",
});
assert.deepEqual(selectAgencyInvite(null, consultantInvite), {
  invite: consultantInvite,
  inviteType: "consultant",
  status: "selected",
});
assert.deepEqual(selectAgencyInvite(null, null), {
  invite: null,
  inviteType: null,
  status: "not_found",
});
assert.deepEqual(selectAgencyInvite(clientInvite, consultantInvite), {
  invite: null,
  inviteType: null,
  status: "ambiguous",
});

const clientActionsSource = readFileSync("app/(app)/clients/actions.ts", "utf8");

assert.match(clientActionsSource, /revalidatePath\("\/agency\/dashboard"\)/);
assert.match(
  clientActionsSource,
  /revalidatePath\(`\/agency\/clients\/\$\{encodedClientOrgId\}`\)/,
);

console.log("agency invite selection and client cache smoke passed");
