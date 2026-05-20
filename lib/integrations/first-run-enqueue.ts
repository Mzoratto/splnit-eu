import { inngest } from "@/inngest/client";
import { acquireIntegrationFirstRunEnqueueLock } from "@/lib/integrations/locks";

type FirstRunLock = {
  acquired: boolean;
  enabled: boolean;
  release: () => Promise<void>;
};

type FirstRunEvent = {
  id: string;
  name: "integrations/tests.run";
  data: {
    clerkOrgId: string;
    integrationId: string;
    provider: string;
    trigger: "oauth_callback_first_run";
  };
};

type FirstRunEnqueueDeps = {
  acquireLock?: (input: {
    clerkOrgId: string;
    provider: string;
  }) => Promise<FirstRunLock>;
  sendEvent?: (event: FirstRunEvent) => Promise<unknown>;
};

export async function enqueueIntegrationFirstRun(
  input: {
    clerkOrgId: string;
    integrationId: string;
    provider: string;
  },
  deps: FirstRunEnqueueDeps = {},
) {
  const acquireLock = deps.acquireLock ?? acquireIntegrationFirstRunEnqueueLock;
  const sendEvent = deps.sendEvent ?? ((event: FirstRunEvent) => inngest.send(event));
  const lock = await acquireLock({
    clerkOrgId: input.clerkOrgId,
    provider: input.provider,
  });

  if (!lock.acquired) {
    return { enqueued: false, lockEnabled: lock.enabled };
  }

  try {
    await sendEvent({
      id: `integration-first-run:${input.clerkOrgId}:${input.provider}:${input.integrationId}`,
      name: "integrations/tests.run",
      data: {
        clerkOrgId: input.clerkOrgId,
        integrationId: input.integrationId,
        provider: input.provider,
        trigger: "oauth_callback_first_run",
      },
    });
  } catch (error) {
    await lock.release();
    throw error;
  }

  return { enqueued: true, lockEnabled: lock.enabled };
}
