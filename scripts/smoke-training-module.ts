import assert from "node:assert/strict";
import { loadEnvConfig } from "@next/env";
import { eq } from "drizzle-orm";
import {
  createTrainingRecordAction,
  deleteTrainingRecordAction,
} from "@/app/(app)/training/actions";
import { getDb } from "@/lib/db";
import {
  createTrainingRecord,
  deleteTrainingRecord,
  getTrainingGapSummary,
  summarizeTrainingRecords,
} from "@/lib/db/queries/training";
import { organisations } from "@/lib/db/schema";

loadEnvConfig(process.cwd());

const db = getDb();
const clerkOrgId = `org_training_smoke_${Date.now()}`;
const today = new Date("2026-05-22T12:00:00.000Z");

async function main() {
  assert.equal(typeof createTrainingRecordAction, "function");
  assert.equal(typeof deleteTrainingRecordAction, "function");

  const emptySummary = summarizeTrainingRecords([], today);
  assert.deepEqual(
    {
      current: emptySummary.current,
      expired: emptySummary.expired,
      expiringSoon: emptySummary.expiringSoon,
      total: emptySummary.total,
    },
    {
      current: 0,
      expired: 0,
      expiringSoon: 0,
      total: 0,
    },
  );

  await db.insert(organisations).values({
    clerkOrgId,
    name: "Training smoke org",
  });

  try {
    const current = await createTrainingRecord({
      clerkOrgId,
      createdBy: "user_training_smoke",
      employeeEmail: "current@example.test",
      employeeName: "Current Employee",
      employeeRole: "employee",
      provider: "Internal",
      trainingDate: "2026-04-01",
      trainingType: "security_awareness",
    });
    const expiring = await createTrainingRecord({
      clerkOrgId,
      createdBy: "user_training_smoke",
      employeeName: "Expiring Manager",
      employeeRole: "manager",
      trainingDate: "2025-07-22",
      trainingType: "role_based",
    });
    await createTrainingRecord({
      clerkOrgId,
      createdBy: "user_training_smoke",
      employeeName: "Expired Contractor",
      employeeRole: "contractor",
      trainingDate: "2025-05-21",
      trainingType: "privacy",
    });

    assert.ok(current.id);
    assert.ok(expiring.id);

    const summary = await getTrainingGapSummary(clerkOrgId, today);
    assert.equal(summary.total, 3);
    assert.equal(summary.current, 1);
    assert.equal(summary.expiringSoon, 1);
    assert.equal(summary.expired, 1);

    const deleted = await deleteTrainingRecord({
      clerkOrgId,
      recordId: expiring.id,
    });
    assert.equal(deleted.deleted, true);
    assert.equal(deleted.recordId, expiring.id);

    const afterDelete = await getTrainingGapSummary(clerkOrgId, today);
    assert.equal(afterDelete.total, 2);
    assert.equal(afterDelete.expiringSoon, 0);
  } finally {
    await db
      .delete(organisations)
      .where(eq(organisations.clerkOrgId, clerkOrgId));
  }

  console.log("training module smoke passed");
}

void main();
