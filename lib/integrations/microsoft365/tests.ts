import type { Integration } from "@/lib/db/schema";
import type { IntegrationAdapter, TestResult } from "../types";

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

type GraphApiRequest = {
  select: (fields: string) => GraphApiRequest;
  top: (count: number) => GraphApiRequest;
  filter: (query: string) => GraphApiRequest;
  get: () => Promise<unknown>;
};

type GraphClient = {
  api: (path: string) => GraphApiRequest;
};

type MicrosoftGraphCollectionFailure = {
  data: Record<string, unknown>;
  failureReason: string;
  status: TestResult["status"];
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

function getGraphStatusCode(error: unknown) {
  if (typeof error !== "object" || error === null) {
    return null;
  }

  const maybeError = error as {
    status?: unknown;
    statusCode?: unknown;
    response?: { status?: unknown };
  };
  const status = maybeError.statusCode ?? maybeError.status ?? maybeError.response?.status;
  const numericStatus = Number(status);

  return Number.isInteger(numericStatus) ? numericStatus : null;
}

function describeGraphError(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error !== null) {
    const maybeError = error as { code?: unknown; statusCode?: unknown; message?: unknown };
    return [maybeError.code, maybeError.statusCode, maybeError.message]
      .filter(Boolean)
      .map(String)
      .join(" ");
  }

  return String(error);
}

function graphUserLabel(user: GraphUser) {
  return user.userPrincipalName ?? user.displayName ?? user.id;
}

export function classifyMicrosoftGraphCollectionFailure(input: {
  affectedResource?: string;
  error: unknown;
}): MicrosoftGraphCollectionFailure {
  const statusCode = getGraphStatusCode(input.error);
  const graphError = describeGraphError(input.error);
  const target = input.affectedResource ? ` for ${input.affectedResource}` : "";

  if (
    statusCode === 401 ||
    statusCode === 403 ||
    statusCode === 404 ||
    statusCode === null
  ) {
    return {
      status: "error",
      data: {
        blockedReason: "missing_permission",
        graphStatusCode: statusCode,
      },
      failureReason: `Cannot read Microsoft 365 evidence${target}. Review Microsoft Graph permissions and upload evidence manually.${graphError ? ` Graph error: ${graphError}` : ""}`,
    };
  }

  if (statusCode === 429 || statusCode >= 500) {
    return {
      status: "error",
      data: {
        blockedReason: "collection_failed",
        graphStatusCode: statusCode,
      },
      failureReason: `Microsoft 365 evidence collection failed${target}; retry after Microsoft Graph recovers.${graphError ? ` Graph error: ${graphError}` : ""}`,
    };
  }

  return {
    status: "error",
    data: {
      blockedReason: "collection_failed",
      graphStatusCode: statusCode,
    },
    failureReason: `Microsoft 365 evidence collection failed${target}.${graphError ? ` Graph error: ${graphError}` : ""}`,
  };
}

export async function runMicrosoft365CheckWithClient(
  checkLogic: string,
  client: GraphClient,
): Promise<TestResult> {
  switch (checkLogic) {
    case "check_mfa_enabled": {
      const users = await client
        .api("/users")
        .select("id,displayName,userPrincipalName")
        .top(999)
        .get() as GraphCollection<GraphUser>;

      const authMethods = await Promise.all(
        users.value.map(async (user) => {
          try {
            const methods = await client
              .api(`/users/${user.id}/authentication/methods`)
              .get() as GraphCollection<Record<string, unknown>>;
            return { user, methods: methods.value, error: null };
          } catch (error) {
            return { user, methods: [] as Record<string, unknown>[], error };
          }
        }),
      );

      const blockedReads = authMethods.filter((result) => result.error !== null);
      if (blockedReads.length > 0) {
        const affectedUsers = blockedReads
          .slice(0, 3)
          .map(({ user }) => graphUserLabel(user))
          .join(", ");
        const failure = classifyMicrosoftGraphCollectionFailure({
          affectedResource: `${blockedReads.length} authentication method read(s): ${affectedUsers}${blockedReads.length > 3 ? "..." : ""}`,
          error: blockedReads[0]?.error,
        });

        return {
          ...failure,
          data: {
            ...failure.data,
            blockedUserCount: blockedReads.length,
            totalUsers: users.value.length,
          },
        };
      }

      const mfaDisabled = authMethods
        .filter(({ methods }) => !hasMfaMethod(methods))
        .map(({ user }) => user);

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
          .map((user) => graphUserLabel(user))
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
      } catch (error) {
        return classifyMicrosoftGraphCollectionFailure({
          affectedResource: "security training assignments",
          error,
        });
      }
    }

    case "check_sensitivity_labels":
    case "check_sharepoint_encryption": {
      try {
        const labels = await client
          .api("/security/informationProtection/sensitivityLabels")
          .get() as GraphCollection<Record<string, unknown>>;

        return labels.value.length > 0
          ? { status: "pass", data: { labelCount: labels.value.length } }
          : {
              status: "warning",
              data: {},
              failureReason:
                "No sensitivity labels configured; consider data classification",
            };
      } catch (error) {
        return classifyMicrosoftGraphCollectionFailure({
          affectedResource: "sensitivity labels",
          error,
        });
      }
    }

    default:
      return {
        status: "not_applicable",
        data: {},
        failureReason: `Unknown check: ${checkLogic}`,
      };
  }
}

export const microsoft365Adapter: IntegrationAdapter = {
  provider: "microsoft365",

  async runTest(checkLogic: string, integration: Integration): Promise<TestResult> {
    const { getGraphClient } = await import("./client");
    const client = await getGraphClient(integration);
    return runMicrosoft365CheckWithClient(checkLogic, client);
  },
};
