import * as assert from "node:assert/strict";
import { runMicrosoft365CheckWithClient } from "../lib/integrations/microsoft365/tests";

type GraphResponse = { value: Record<string, unknown>[] };

type FakeRoute = {
  response?: GraphResponse;
  error?: unknown;
};

function fakeGraphClient(routes: Record<string, FakeRoute>) {
  return {
    api(path: string) {
      const route = routes[path];
      const chain = {
        select() {
          return chain;
        },
        top() {
          return chain;
        },
        filter() {
          return chain;
        },
        async get() {
          if (!route) {
            throw new Error(`No fake Graph route configured for ${path}`);
          }
          if (route.error) {
            throw route.error;
          }
          return route.response;
        },
      };
      return chain;
    },
  };
}

const users = {
  value: [
    {
      id: "user-with-no-mfa",
      displayName: "No MFA User",
      userPrincipalName: "no-mfa@example.test",
    },
  ],
};

async function main() {
  const noMfaResult = await runMicrosoft365CheckWithClient(
    "check_mfa_enabled",
    fakeGraphClient({
      "/users": { response: users },
      "/users/user-with-no-mfa/authentication/methods": { response: { value: [] } },
    }),
  );

  assert.equal(noMfaResult.status, "fail", "empty methods list is a real no-MFA finding");
  assert.equal(noMfaResult.data.mfaDisabledCount, 1);
  assert.match(noMfaResult.failureReason ?? "", /no-mfa@example\.test/);

  for (const statusCode of [401, 403, 404]) {
    const permissionFailureResult = await runMicrosoft365CheckWithClient(
      "check_mfa_enabled",
      fakeGraphClient({
        "/users": { response: users },
        "/users/user-with-no-mfa/authentication/methods": {
          error: Object.assign(new Error(`Graph permission failure ${statusCode}`), {
            statusCode,
            code: "Authorization_RequestDenied",
          }),
        },
      }),
    );

    assert.equal(permissionFailureResult.status, "error");
    assert.equal(permissionFailureResult.data.blockedReason, "missing_permission");
    assert.equal(permissionFailureResult.data.graphStatusCode, statusCode);
    assert.equal(permissionFailureResult.data.totalUsers, 1);
    assert.equal(permissionFailureResult.data.blockedUserCount, 1);
    assert.match(permissionFailureResult.failureReason ?? "", /Review Microsoft Graph permissions/i);
  }

  for (const statusCode of [429, 500, 503]) {
    const transientFailureResult = await runMicrosoft365CheckWithClient(
      "check_mfa_enabled",
      fakeGraphClient({
        "/users": { response: users },
        "/users/user-with-no-mfa/authentication/methods": {
          error: Object.assign(new Error(`Graph transient failure ${statusCode}`), {
            statusCode,
          }),
        },
      }),
    );

    assert.equal(transientFailureResult.status, "error");
    assert.equal(transientFailureResult.data.blockedReason, "collection_failed");
    assert.equal(transientFailureResult.data.graphStatusCode, statusCode);
  }

  console.log("Microsoft 365 permission failure smoke test passed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
