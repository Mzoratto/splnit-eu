import { and, asc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import {
  vboManagementTrainings,
  vboRecoveryApprovals,
  vboRecoveryPriorities,
  vboResponsiblePersons,
  type VboManagementTraining,
  type VboRecoveryApproval,
  type VboRecoveryPriority,
  type VboResponsiblePerson,
} from "@/lib/db/schema";

export type VboVedeniData = {
  responsiblePersons: VboResponsiblePerson[];
  trainings: VboManagementTraining[];
  priorities: VboRecoveryPriority[];
  approval: VboRecoveryApproval | null;
};

export async function getVboVedeniData(clerkOrgId: string): Promise<VboVedeniData> {
  const db = getDb();
  const [responsiblePersons, trainings, priorities, approvals] = await Promise.all([
    db
      .select()
      .from(vboResponsiblePersons)
      .where(eq(vboResponsiblePersons.clerkOrgId, clerkOrgId))
      .orderBy(asc(vboResponsiblePersons.createdAt)),
    db
      .select()
      .from(vboManagementTrainings)
      .where(eq(vboManagementTrainings.clerkOrgId, clerkOrgId))
      .orderBy(asc(vboManagementTrainings.createdAt)),
    db
      .select()
      .from(vboRecoveryPriorities)
      .where(eq(vboRecoveryPriorities.clerkOrgId, clerkOrgId))
      .orderBy(asc(vboRecoveryPriorities.sortOrder)),
    db
      .select()
      .from(vboRecoveryApprovals)
      .where(eq(vboRecoveryApprovals.clerkOrgId, clerkOrgId))
      .limit(1),
  ]);

  return {
    approval: approvals[0] ?? null,
    priorities,
    responsiblePersons,
    trainings,
  };
}

export async function createVboResponsiblePerson(input: {
  clerkOrgId: string;
  name: string;
  designatedOn: string;
  authorityDocUrl: string | null;
  qualificationNote: string | null;
  qualificationFileUrl: string | null;
}): Promise<void> {
  await getDb().insert(vboResponsiblePersons).values(input);
}

export async function deleteVboResponsiblePerson(input: {
  clerkOrgId: string;
  id: string;
}): Promise<void> {
  await getDb()
    .delete(vboResponsiblePersons)
    .where(
      and(
        eq(vboResponsiblePersons.clerkOrgId, input.clerkOrgId),
        eq(vboResponsiblePersons.id, input.id),
      ),
    );
}

export async function createVboTraining(input: {
  clerkOrgId: string;
  memberName: string;
  memberRole: string | null;
  initialTrainingOn: string | null;
  lastRegularTrainingOn: string | null;
  trainingSource: string | null;
}): Promise<void> {
  await getDb().insert(vboManagementTrainings).values(input);
}

export async function updateVboTrainingDates(input: {
  clerkOrgId: string;
  id: string;
  initialTrainingOn: string | null;
  lastRegularTrainingOn: string | null;
}): Promise<void> {
  await getDb()
    .update(vboManagementTrainings)
    .set({
      initialTrainingOn: input.initialTrainingOn,
      lastRegularTrainingOn: input.lastRegularTrainingOn,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(vboManagementTrainings.clerkOrgId, input.clerkOrgId),
        eq(vboManagementTrainings.id, input.id),
      ),
    );
}

export async function deleteVboTraining(input: {
  clerkOrgId: string;
  id: string;
}): Promise<void> {
  await getDb()
    .delete(vboManagementTrainings)
    .where(
      and(
        eq(vboManagementTrainings.clerkOrgId, input.clerkOrgId),
        eq(vboManagementTrainings.id, input.id),
      ),
    );
}

export async function createVboRecoveryPriority(input: {
  clerkOrgId: string;
  assetName: string;
  sortOrder: number;
  note: string | null;
}): Promise<void> {
  await getDb().insert(vboRecoveryPriorities).values(input);
}

export async function deleteVboRecoveryPriority(input: {
  clerkOrgId: string;
  id: string;
}): Promise<void> {
  await getDb()
    .delete(vboRecoveryPriorities)
    .where(
      and(
        eq(vboRecoveryPriorities.clerkOrgId, input.clerkOrgId),
        eq(vboRecoveryPriorities.id, input.id),
      ),
    );
}

export async function upsertVboRecoveryApproval(input: {
  clerkOrgId: string;
  approvedOn: string;
}): Promise<void> {
  await getDb()
    .insert(vboRecoveryApprovals)
    .values({ approvedOn: input.approvedOn, clerkOrgId: input.clerkOrgId })
    .onConflictDoUpdate({
      set: { approvedOn: input.approvedOn, updatedAt: new Date() },
      target: vboRecoveryApprovals.clerkOrgId,
    });
}
