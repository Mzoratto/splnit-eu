import assert from "node:assert/strict";
import { hasDatabaseUrl } from "@/lib/db";
import {
  hasPlanAccess,
  planGateBypassIsEnabled,
  requirePlan,
} from "@/lib/stripe/plans";
import {
  billingGracePeriodIsActive,
  orgHasPlan,
  orgIsSubscribed,
  requireActiveSubscription,
} from "@/lib/stripe/subscriptions";

const original = {
  billingEnforcementDate: process.env.BILLING_ENFORCEMENT_DATE,
  enableTestRoutes: process.env.ENABLE_TEST_ROUTES,
  nextPublicEnableTestRoutes: process.env.NEXT_PUBLIC_ENABLE_TEST_ROUTES,
  nodeEnv: process.env.NODE_ENV,
  testBypassPlanGate: process.env.TEST_BYPASS_PLAN_GATE,
};

function restoreEnv() {
  restoreEnvValue("BILLING_ENFORCEMENT_DATE", original.billingEnforcementDate);
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

async function assertMissingOrgIsBlocked() {
  if (!hasDatabaseUrl()) {
    return;
  }

  assert.equal(await orgHasPlan("org_missing_enforcement_smoke", "agency"), false);
  assert.equal(await orgIsSubscribed("org_missing_enforcement_smoke"), false);
  assert.deepEqual(await requireActiveSubscription("org_missing_enforcement_smoke"), {
    subscribed: false,
  });
}

async function main() {
  try {
    delete process.env.BILLING_ENFORCEMENT_DATE;
    delete process.env.ENABLE_TEST_ROUTES;
    delete process.env.NEXT_PUBLIC_ENABLE_TEST_ROUTES;
    delete process.env.TEST_BYPASS_PLAN_GATE;
    setEnvValue("NODE_ENV", "test");

    assert.equal(planGateBypassIsEnabled(), false);
    assert.equal(billingGracePeriodIsActive(), false);
    assert.equal(hasPlanAccess("free", "agency"), false);
    assert.throws(() => requirePlan("free", "agency"), /Plan agency is required/);
    await assertMissingOrgIsBlocked();

    setEnvValue("BILLING_ENFORCEMENT_DATE", "2999-01-01T00:00:00.000Z");
    assert.equal(billingGracePeriodIsActive(), true);

    setEnvValue("NODE_ENV", "production");
    setEnvValue("TEST_BYPASS_PLAN_GATE", "true");
    setEnvValue("ENABLE_TEST_ROUTES", "true");
    setEnvValue("NEXT_PUBLIC_ENABLE_TEST_ROUTES", "true");
    assert.equal(planGateBypassIsEnabled(), false);
    assert.equal(billingGracePeriodIsActive(), false);
    assert.equal(hasPlanAccess("free", "agency"), false);
    assert.throws(() => requirePlan("free", "agency"), /Plan agency is required/);
    await assertMissingOrgIsBlocked();

    console.log("plan gate enforcement smoke passed");
  } finally {
    restoreEnv();
  }
}

void main();
