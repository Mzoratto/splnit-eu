import type { Integration } from "@/lib/db/schema";
import type { IntegrationAdapter, TestResult } from "../types";
import { getGraphClient } from "./client";

type GraphCollection<T> = {
  value: T[];
};

type GraphUser = {
  id: string;
  displayName?: string;
  userPrincipalName?: string;
  signInActivity?: {
    lastSignInDateTime?: string;
  };
};

function hasMfaMethod(methods: Record<string, unknown>[]) {
  const supportedMethods = new Set([
    "#microsoft.graph.microsoftAuthenticatorAuthenticationMethod",
    "#microsoft.graph.phoneAuthenticationMethod",
    "#microsoft.graph.fido2AuthenticationMethod",
    "#microsoft.graph.windowsHelloForBusinessAuthenticationMethod",
  ]);

  return methods.some((method) =>
    supportedMethods.has(String(method["@odata.type"] ?? "")),
  );
}

export const microsoft365Adapter: IntegrationAdapter = {
  provider: "microsoft365",

  async runTest(checkLogic: string, integration: Integration): Promise<TestResult> {
    const client = getGraphClient(integration);

    switch (checkLogic) {
      case "check_mfa_enabled": {
        const users = await client
          .api("/users")
          .select("id,displayName,userPrincipalName")
          .top(999)
          .get() as GraphCollection<GraphUser>;

        const authMethods = await Promise.all(
          users.value.map((user) =>
            client
              .api(`/users/${user.id}/authentication/methods`)
              .get()
              .catch(() => ({ value: [] as Record<string, unknown>[] })),
          ),
        );

        const mfaDisabled = users.value.filter((_, index) => {
          const methods = authMethods[index]?.value ?? [];
          return !hasMfaMethod(methods);
        });

        if (mfaDisabled.length === 0) {
          return {
            status: "pass",
            data: { totalUsers: users.value.length, mfaEnabled: users.value.length },
          };
        }

        return {
          status: "fail",
          data: {
            totalUsers: users.value.length,
            mfaDisabledCount: mfaDisabled.length,
          },
          failureReason: `${mfaDisabled.length} user(s) without MFA: ${mfaDisabled
            .slice(0, 3)
            .map((user) => user.userPrincipalName ?? user.displayName ?? user.id)
            .join(", ")}${mfaDisabled.length > 3 ? "..." : ""}`,
        };
      }

      case "check_conditional_access": {
        const policies = await client
          .api("/identity/conditionalAccess/policies")
          .get() as GraphCollection<{ state?: string }>;
        const enabled = policies.value.filter((policy) => policy.state === "enabled");

        return enabled.length > 0
          ? { status: "pass", data: { enabledPolicies: enabled.length } }
          : {
              status: "fail",
              data: {},
              failureReason: "No conditional access policies enabled",
            };
      }

      case "check_privileged_roles": {
        const roles = await client
          .api("/directoryRoles")
          .filter("roleTemplateId eq '62e90394-69f5-4237-9190-012177145e10'")
          .get() as GraphCollection<{ id: string }>;

        if (!roles.value[0]) {
          return { status: "pass", data: { globalAdminCount: 0 } };
        }

        const globalAdmins = await client
          .api(`/directoryRoles/${roles.value[0].id}/members`)
          .get() as GraphCollection<Record<string, unknown>>;
        const count = globalAdmins.value.length;

        return count <= 3
          ? { status: "pass", data: { globalAdminCount: count } }
          : {
              status: "warning",
              data: { globalAdminCount: count },
              failureReason: `${count} Global Admins found; best practice is <= 3`,
            };
      }

      case "check_guest_users": {
        const guests = await client
          .api("/users")
          .filter("userType eq 'Guest'")
          .select("id,displayName,userPrincipalName,signInActivity")
          .get() as GraphCollection<GraphUser>;

        const stale = guests.value.filter((guest) => {
          const lastSignIn = guest.signInActivity?.lastSignInDateTime;
          if (!lastSignIn) {
            return true;
          }

          const daysSince =
            (Date.now() - new Date(lastSignIn).getTime()) / 86_400_000;
          return daysSince > 90;
        });

        return stale.length === 0
          ? { status: "pass", data: { totalGuests: guests.value.length } }
          : {
              status: "warning",
              data: { staleGuestCount: stale.length },
              failureReason: `${stale.length} guest account(s) inactive for 90+ days`,
            };
      }

      case "check_security_training": {
        try {
          const assignments = await client
            .api("/education/assignments")
            .get() as GraphCollection<Record<string, unknown>>;
          return { status: "pass", data: { assignmentCount: assignments.value.length } };
        } catch {
          return {
            status: "manual_review",
            data: {},
            failureReason:
              "Cannot verify training automatically; upload training records manually",
          };
        }
      }

      case "check_sharepoint_encryption": {
        const labels = await client
          .api("/security/informationProtection/sensitivityLabels")
          .get()
          .catch(() => ({ value: [] as Record<string, unknown>[] }));

        return labels.value.length > 0
          ? { status: "pass", data: { labelCount: labels.value.length } }
          : {
              status: "warning",
              data: {},
              failureReason:
                "No sensitivity labels configured; consider data classification",
            };
      }

      default:
        return {
          status: "not_applicable",
          data: {},
          failureReason: `Unknown check: ${checkLogic}`,
        };
    }
  },
};
