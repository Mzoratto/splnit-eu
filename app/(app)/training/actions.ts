"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createAuditLog } from "@/lib/db/queries/audit-logs";
import {
  createTrainingRecord,
  deleteTrainingRecord,
} from "@/lib/db/queries/training";

const employeeRoleSchema = z.enum([
  "employee",
  "manager",
  "it_admin",
  "security_owner",
  "contractor",
]);

const trainingTypeSchema = z.enum([
  "security_awareness",
  "role_based",
  "incident_response",
  "ai_literacy",
  "privacy",
]);

const createTrainingRecordSchema = z.object({
  employeeEmail: z
    .string()
    .trim()
    .max(254)
    .refine((value) => !value || z.string().email().safeParse(value).success)
    .transform((value) => value || null),
  employeeName: z.string().trim().min(1).max(160),
  employeeRole: employeeRoleSchema,
  notes: z.string().trim().max(2000).optional(),
  provider: z.string().trim().max(160).optional(),
  trainingDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine((value) => value <= new Date().toISOString().slice(0, 10), {
      message: "Training date cannot be in the future.",
    }),
  trainingType: trainingTypeSchema,
});

const deleteTrainingRecordSchema = z.object({
  recordId: z.uuid(),
});

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

async function requireActiveSession() {
  const session = await auth();

  if (!session.userId || !session.orgId) {
    redirect("/sign-in");
  }

  return {
    clerkOrgId: session.orgId,
    userId: session.userId,
  };
}

function revalidateTrainingPaths() {
  revalidatePath("/training");
  revalidatePath("/team");
  revalidatePath("/controls");
  revalidatePath("/dashboard");
  revalidatePath("/settings/audit-log");
}

export async function createTrainingRecordAction(formData: FormData) {
  const session = await requireActiveSession();
  const parsed = createTrainingRecordSchema.parse({
    employeeEmail: getStringValue(formData, "employeeEmail"),
    employeeName: getStringValue(formData, "employeeName"),
    employeeRole: getStringValue(formData, "employeeRole"),
    notes: getStringValue(formData, "notes"),
    provider: getStringValue(formData, "provider"),
    trainingDate: getStringValue(formData, "trainingDate"),
    trainingType: getStringValue(formData, "trainingType"),
  });
  const record = await createTrainingRecord({
    clerkOrgId: session.clerkOrgId,
    createdBy: session.userId,
    employeeEmail: parsed.employeeEmail,
    employeeName: parsed.employeeName,
    employeeRole: parsed.employeeRole,
    notes: parsed.notes,
    provider: parsed.provider,
    trainingDate: parsed.trainingDate,
    trainingType: parsed.trainingType,
  });

  await createAuditLog({
    action: "training.record_created",
    clerkOrgId: session.clerkOrgId,
    clerkUserId: session.userId,
    entityId: record.id,
    entityType: "employee_training_record",
    metadata: {
      employeeRole: parsed.employeeRole,
      trainingDate: parsed.trainingDate,
      trainingType: parsed.trainingType,
    },
  });

  revalidateTrainingPaths();
}

export async function deleteTrainingRecordAction(formData: FormData) {
  const session = await requireActiveSession();
  const parsed = deleteTrainingRecordSchema.parse({
    recordId: getStringValue(formData, "recordId"),
  });
  const result = await deleteTrainingRecord({
    clerkOrgId: session.clerkOrgId,
    recordId: parsed.recordId,
  });

  if (result.deleted) {
    await createAuditLog({
      action: "training.record_deleted",
      clerkOrgId: session.clerkOrgId,
      clerkUserId: session.userId,
      entityId: parsed.recordId,
      entityType: "employee_training_record",
      metadata: {},
    });
  }

  revalidateTrainingPaths();
}
