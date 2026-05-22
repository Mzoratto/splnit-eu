import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import {
  employeeTrainingRecords,
  type EmployeeTrainingRecord,
  type EmployeeTrainingRole,
  type EmployeeTrainingType,
} from "@/lib/db/schema";

export type TrainingGapStatus = "current" | "expiring_soon" | "expired";

export type TrainingRecordInput = {
  clerkOrgId: string;
  createdBy: string;
  employeeEmail?: string | null;
  employeeName: string;
  employeeRole: EmployeeTrainingRole;
  notes?: string | null;
  provider?: string | null;
  trainingDate: string;
  trainingType: EmployeeTrainingType;
};

export type TrainingGapSummary = {
  current: number;
  expired: number;
  expiringSoon: number;
  records: Array<EmployeeTrainingRecord & { gapStatus: TrainingGapStatus }>;
  total: number;
};

function dateOnly(value: Date) {
  return value.toISOString().slice(0, 10);
}

function addUtcMonths(value: Date, monthDelta: number) {
  const next = new Date(Date.UTC(
    value.getUTCFullYear(),
    value.getUTCMonth(),
    value.getUTCDate(),
  ));
  next.setUTCMonth(next.getUTCMonth() + monthDelta);
  return next;
}

export function classifyTrainingDate(
  trainingDate: string,
  today = new Date(),
): TrainingGapStatus {
  const expiredBefore = dateOnly(addUtcMonths(today, -12));
  const expiringFrom = dateOnly(addUtcMonths(today, -10));

  if (trainingDate < expiredBefore) {
    return "expired";
  }

  if (trainingDate <= expiringFrom) {
    return "expiring_soon";
  }

  return "current";
}

export function summarizeTrainingRecords(
  records: EmployeeTrainingRecord[],
  today = new Date(),
): TrainingGapSummary {
  const withStatus = records.map((record) => ({
    ...record,
    gapStatus: classifyTrainingDate(record.trainingDate, today),
  }));

  return {
    current: withStatus.filter((record) => record.gapStatus === "current").length,
    expired: withStatus.filter((record) => record.gapStatus === "expired").length,
    expiringSoon: withStatus.filter((record) => record.gapStatus === "expiring_soon").length,
    records: withStatus,
    total: withStatus.length,
  };
}

export async function listTrainingRecordsForOrg(clerkOrgId: string) {
  const db = getDb();

  return db
    .select()
    .from(employeeTrainingRecords)
    .where(eq(employeeTrainingRecords.clerkOrgId, clerkOrgId))
    .orderBy(
      desc(employeeTrainingRecords.trainingDate),
      desc(employeeTrainingRecords.createdAt),
    );
}

export async function createTrainingRecord(input: TrainingRecordInput) {
  const db = getDb();
  const rows = await db
    .insert(employeeTrainingRecords)
    .values({
      clerkOrgId: input.clerkOrgId,
      createdBy: input.createdBy,
      employeeEmail: input.employeeEmail?.trim() || null,
      employeeName: input.employeeName.trim(),
      employeeRole: input.employeeRole,
      notes: input.notes?.trim() || null,
      provider: input.provider?.trim() || null,
      trainingDate: input.trainingDate,
      trainingType: input.trainingType,
    })
    .returning({ id: employeeTrainingRecords.id });
  const row = rows[0] ?? null;

  if (!row) {
    throw new Error("Training record could not be created.");
  }

  return row;
}

export async function deleteTrainingRecord(input: {
  clerkOrgId: string;
  recordId: string;
}) {
  const db = getDb();
  const rows = await db
    .delete(employeeTrainingRecords)
    .where(
      and(
        eq(employeeTrainingRecords.clerkOrgId, input.clerkOrgId),
        eq(employeeTrainingRecords.id, input.recordId),
      ),
    )
    .returning({ id: employeeTrainingRecords.id });

  return {
    deleted: rows.length > 0,
    recordId: rows[0]?.id ?? null,
  };
}

export async function getTrainingGapSummary(
  clerkOrgId: string,
  today = new Date(),
): Promise<TrainingGapSummary> {
  const records = await listTrainingRecordsForOrg(clerkOrgId);
  return summarizeTrainingRecords(records, today);
}
