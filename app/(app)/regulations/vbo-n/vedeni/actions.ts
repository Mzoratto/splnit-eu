"use server";

import { auth } from "@clerk/nextjs/server";
import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { getOrganisationByClerkOrgId } from "@/lib/db/queries/organisations";
import {
  createVboRecoveryPriority,
  createVboResponsiblePerson,
  createVboTraining,
  deleteVboRecoveryPriority,
  deleteVboResponsiblePerson,
  deleteVboTraining,
  updateVboTrainingDates,
  upsertVboRecoveryApproval,
} from "@/lib/db/queries/vbo-vedeni";

async function requireNizsiOrgId(): Promise<string> {
  const session = await auth();

  if (!session.userId || !session.orgId) {
    throw new Error("Unauthorized.");
  }

  const organisation = await getOrganisationByClerkOrgId(session.orgId);

  if (organisation?.rezimPovinnosti !== "nizsi") {
    throw new Error("VBO-N is only available in the lower-obligations regime.");
  }

  return session.orgId;
}

function getStringValue(formData: FormData, key: string): string | null {
  const value = formData.get(key);

  return typeof value === "string" && value.trim() ? value.trim() : null;
}

async function uploadOptionalFile(
  formData: FormData,
  key: string,
  clerkOrgId: string,
  prefix: string,
): Promise<string | null> {
  const file = formData.get(key);

  if (!(file instanceof File) || file.size === 0) {
    return null;
  }

  const blob = await put(
    `vbo-vedeni/${clerkOrgId}/${prefix}-${Date.now()}-${file.name}`,
    file,
    { access: "private" },
  );

  return blob.url;
}

function revalidateVboN() {
  revalidatePath("/regulations/vbo-n/vedeni");
  revalidatePath("/regulations/vbo-n");
}

export async function createResponsiblePersonAction(formData: FormData) {
  const clerkOrgId = await requireNizsiOrgId();
  const name = getStringValue(formData, "name");
  const designatedOn = getStringValue(formData, "designatedOn");

  if (!name || !designatedOn) {
    throw new Error("Jméno a datum určení jsou povinné.");
  }

  const qualificationFileUrl = await uploadOptionalFile(
    formData,
    "qualificationFile",
    clerkOrgId,
    "kvalifikace",
  );
  const authorityFileUrl = await uploadOptionalFile(
    formData,
    "authorityFile",
    clerkOrgId,
    "pravomoci",
  );

  await createVboResponsiblePerson({
    authorityDocUrl: authorityFileUrl ?? getStringValue(formData, "authorityDocUrl"),
    clerkOrgId,
    designatedOn,
    name,
    qualificationFileUrl,
    qualificationNote: getStringValue(formData, "qualificationNote"),
  });

  revalidateVboN();
}

export async function deleteResponsiblePersonAction(formData: FormData) {
  const clerkOrgId = await requireNizsiOrgId();
  const id = getStringValue(formData, "id");

  if (id) {
    await deleteVboResponsiblePerson({ clerkOrgId, id });
    revalidateVboN();
  }
}

export async function createTrainingAction(formData: FormData) {
  const clerkOrgId = await requireNizsiOrgId();
  const memberName = getStringValue(formData, "memberName");

  if (!memberName) {
    throw new Error("Jméno člena vedení je povinné.");
  }

  await createVboTraining({
    clerkOrgId,
    initialTrainingOn: getStringValue(formData, "initialTrainingOn"),
    lastRegularTrainingOn: getStringValue(formData, "lastRegularTrainingOn"),
    memberName,
    memberRole: getStringValue(formData, "memberRole"),
    trainingSource: getStringValue(formData, "trainingSource"),
  });

  revalidateVboN();
}

export async function updateTrainingDatesAction(formData: FormData) {
  const clerkOrgId = await requireNizsiOrgId();
  const id = getStringValue(formData, "id");

  if (!id) {
    return;
  }

  await updateVboTrainingDates({
    clerkOrgId,
    id,
    initialTrainingOn: getStringValue(formData, "initialTrainingOn"),
    lastRegularTrainingOn: getStringValue(formData, "lastRegularTrainingOn"),
  });

  revalidateVboN();
}

export async function deleteTrainingAction(formData: FormData) {
  const clerkOrgId = await requireNizsiOrgId();
  const id = getStringValue(formData, "id");

  if (id) {
    await deleteVboTraining({ clerkOrgId, id });
    revalidateVboN();
  }
}

export async function createRecoveryPriorityAction(formData: FormData) {
  const clerkOrgId = await requireNizsiOrgId();
  const assetName = getStringValue(formData, "assetName");
  const sortOrderRaw = getStringValue(formData, "sortOrder");
  const sortOrder = Number.parseInt(sortOrderRaw ?? "", 10);

  if (!assetName || Number.isNaN(sortOrder)) {
    throw new Error("Název aktiva a pořadí jsou povinné.");
  }

  await createVboRecoveryPriority({
    assetName,
    clerkOrgId,
    note: getStringValue(formData, "note"),
    sortOrder,
  });

  revalidateVboN();
}

export async function deleteRecoveryPriorityAction(formData: FormData) {
  const clerkOrgId = await requireNizsiOrgId();
  const id = getStringValue(formData, "id");

  if (id) {
    await deleteVboRecoveryPriority({ clerkOrgId, id });
    revalidateVboN();
  }
}

export async function setRecoveryApprovalAction(formData: FormData) {
  const clerkOrgId = await requireNizsiOrgId();
  const approvedOn = getStringValue(formData, "approvedOn");

  if (!approvedOn) {
    throw new Error("Datum schválení je povinné.");
  }

  await upsertVboRecoveryApproval({ approvedOn, clerkOrgId });
  revalidateVboN();
}
