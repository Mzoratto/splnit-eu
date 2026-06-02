import * as assert from "node:assert/strict";
import { enqueueIntegrationFirstRun } from "../lib/integrations/first-run-enqueue";

type SentEvent = {
  id: string;
  name: "integrations/tests.run";
  data: {
    clerkOrgId: string;
    integrationId: string;
    provider: string;
    trigger:
      | "oauth_callback_first_run"
      | "api_key_connect_first_run"
      | "credential_rotation_first_run";
  };
};

type LockCall = {
  clerkOrgId: string;
  provider: string;
};

type TestCase = {
  name: string;
  run: () => Promise<void>;
};

function makeScopedLock() {
  const acquiredKeys = new Set<string>();
  const calls: LockCall[] = [];

  return {
    calls,
    acquireLock: async (input: LockCall) => {
      calls.push(input);
      const key = `${input.clerkOrgId}:${input.provider}`;
      const acquired = !acquiredKeys.has(key);

      if (acquired) {
        acquiredKeys.add(key);
      }

      return {
        acquired,
        enabled: true,
        release: async () => {
          acquiredKeys.delete(key);
        },
      };
    },
  };
}

const tests: TestCase[] = [
  {
    name: "callback enqueue sends the first-run integration test event",
    run: async () => {
      const lock = makeScopedLock();
      const sentEvents: SentEvent[] = [];

      const result = await enqueueIntegrationFirstRun(
        {
          clerkOrgId: "org_alpha",
          integrationId: "int_m365_alpha",
          provider: "microsoft365",
        },
        {
          acquireLock: lock.acquireLock,
          sendEvent: async (event) => {
            sentEvents.push(event);
          },
        },
      );

      assert.deepEqual(result, { enqueued: true, lockEnabled: true });
      assert.deepEqual(lock.calls, [
        { clerkOrgId: "org_alpha", provider: "microsoft365" },
      ]);
      assert.deepEqual(sentEvents, [
        {
          id: "integration-first-run:org_alpha:microsoft365:int_m365_alpha",
          name: "integrations/tests.run",
          data: {
            clerkOrgId: "org_alpha",
            integrationId: "int_m365_alpha",
            provider: "microsoft365",
            trigger: "oauth_callback_first_run",
          },
        },
      ]);
    },
  },
  {
    name: "double-fire dedupes the second callback before enqueueing",
    run: async () => {
      const lock = makeScopedLock();
      const sentEvents: SentEvent[] = [];

      const first = await enqueueIntegrationFirstRun(
        {
          clerkOrgId: "org_beta",
          integrationId: "int_m365_beta",
          provider: "microsoft365",
        },
        {
          acquireLock: lock.acquireLock,
          sendEvent: async (event) => {
            sentEvents.push(event);
          },
        },
      );
      const second = await enqueueIntegrationFirstRun(
        {
          clerkOrgId: "org_beta",
          integrationId: "int_m365_beta",
          provider: "microsoft365",
        },
        {
          acquireLock: lock.acquireLock,
          sendEvent: async (event) => {
            sentEvents.push(event);
          },
        },
      );

      assert.equal(first.enqueued, true);
      assert.deepEqual(second, { enqueued: false, lockEnabled: true });
      assert.equal(sentEvents.length, 1);
      assert.equal(
        sentEvents[0]?.id,
        "integration-first-run:org_beta:microsoft365:int_m365_beta",
      );
      assert.deepEqual(lock.calls, [
        { clerkOrgId: "org_beta", provider: "microsoft365" },
        { clerkOrgId: "org_beta", provider: "microsoft365" },
      ]);
    },
  },
  {
    name: "per-org/provider lock blocks same org/provider but not other scopes",
    run: async () => {
      const lock = makeScopedLock();
      const sentEvents: SentEvent[] = [];
      const deps = {
        acquireLock: lock.acquireLock,
        sendEvent: async (event: SentEvent) => {
          sentEvents.push(event);
        },
      };

      const sameScopeFirst = await enqueueIntegrationFirstRun(
        {
          clerkOrgId: "org_gamma",
          integrationId: "int_first",
          provider: "microsoft365",
        },
        deps,
      );
      const sameScopeSecondDifferentIntegration = await enqueueIntegrationFirstRun(
        {
          clerkOrgId: "org_gamma",
          integrationId: "int_second",
          provider: "microsoft365",
        },
        deps,
      );
      const differentOrg = await enqueueIntegrationFirstRun(
        {
          clerkOrgId: "org_delta",
          integrationId: "int_delta",
          provider: "microsoft365",
        },
        deps,
      );
      const differentProvider = await enqueueIntegrationFirstRun(
        {
          clerkOrgId: "org_gamma",
          integrationId: "int_github",
          provider: "github",
        },
        deps,
      );

      assert.equal(sameScopeFirst.enqueued, true);
      assert.deepEqual(sameScopeSecondDifferentIntegration, {
        enqueued: false,
        lockEnabled: true,
      });
      assert.equal(differentOrg.enqueued, true);
      assert.equal(differentProvider.enqueued, true);
      assert.deepEqual(
        sentEvents.map((event) => event.id),
        [
          "integration-first-run:org_gamma:microsoft365:int_first",
          "integration-first-run:org_delta:microsoft365:int_delta",
          "integration-first-run:org_gamma:github:int_github",
        ],
      );
      assert.deepEqual(lock.calls, [
        { clerkOrgId: "org_gamma", provider: "microsoft365" },
        { clerkOrgId: "org_gamma", provider: "microsoft365" },
        { clerkOrgId: "org_delta", provider: "microsoft365" },
        { clerkOrgId: "org_gamma", provider: "github" },
      ]);
    },
  },
];

async function main() {
  for (const test of tests) {
    await test.run();
    console.log(`✓ ${test.name}`);
  }

  console.log("Integration first-run enqueue behavior smoke passed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
