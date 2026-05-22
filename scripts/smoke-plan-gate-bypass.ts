import assert from "node:assert/strict";
import {
  hasPlanAccess,
  planGateBypassIsEnabled,
  requirePlan,
} from "@/lib/stripe/plans";
import {
  orgHasPlan,
  orgIsSubscribed,
  requireActiveSubscription,
} from "@/lib/stripe/subscriptions";

const original = {
  enableTestRoutes: process.env.ENABLE_TEST_ROUTES,
  nextPublicEnableTestRoutes: process.env.NEXT_PUBLIC_ENABLE_TEST_ROUTES,
  nodeEnv: process.env.NODE_ENV,
  testBypassPlanGate: process.env.TEST_BYPASS_PLAN_GATE,
};

function restoreEnv() {
  restoreEnvValue("ENABLE_TEST_ROUTES", original.enableTestRoutes);
  restoreEnvValue("NEXT_PUBLIC_ENABLE_TEST_ROUTES", original.nextPublicEnableTestRoutes);
  restoreEnvValue("NODE_ENV", original.nodeEnv);
  restoreEnvValue("TEST_BYPASS_PLAN_GATE", original.testBypassPlanGate);
}

function restoreEnvValue(key: string, value: string | undefined) {
  const env = process.env as Record<string, string | undefined>;

  if (value === undefined) {
    delete env[key];
    return;
  }

  env[key] = value;
}

function setEnvValue(key: string, value: string) {
  const env = process.env as Record<string, string | undefined>;
  env[key] = value;
}

async function main() {
  try {
    delete process.env.ENABLE_TEST_ROUTES;
    delete process.env.NEXT_PUBLIC_ENABLE_TEST_ROUTES;
    delete process.env.TEST_BYPASS_PLAN_GATE;
    setEnvValue("NODE_ENV", "test");

    assert.equal(planGateBypassIsEnabled(), false);
    assert.equal(hasPlanAccess("free", "agency"), false);
    assert.throws(() => requirePlan("free", "agency"), /Plan agency is required/);

    setEnvValue("TEST_BYPASS_PLAN_GATE", "true");
    assert.equal(planGateBypassIsEnabled(), true);
    assert.equal(hasPlanAccess("free", "agency"), true);
    assert.doesNotThrow(() => requirePlan("free", "agency"));
    assert.equal(await orgHasPlan("org_missing_subscription_smoke", "agency"), true);
    assert.equal(await orgIsSubscribed("org_missing_subscription_smoke"), true);
    assert.deepEqual(
      await requireActiveSubscription("org_missing_subscription_smoke"),
      {
        grandfathered: true,
        plan: "agency",
        subscribed: true,
      },
    );

    setEnvValue("NODE_ENV", "production");
    setEnvValue("ENABLE_TEST_ROUTES", "true");
    setEnvValue("NEXT_PUBLIC_ENABLE_TEST_ROUTES", "true");
    assert.equal(planGateBypassIsEnabled(), false);

    console.log("plan gate bypass smoke passed");
  } finally {
    restoreEnv();
  }
}

void main();
