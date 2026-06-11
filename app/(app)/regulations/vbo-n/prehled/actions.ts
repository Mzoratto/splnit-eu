"use server";

import { auth } from "@clerk/nextjs/server";
import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { getOrganisationByClerkOrgId } from "@/lib/db/queries/organisations";
import {
  getNextPrehledVersionNumber,
  getPrehledEntries,
  insertPrehledVersion,
  upsertPrehledEntry,
} from "@/lib/db/queries/prehled";
import { renderPrehledPdf } from "@/lib/export/prehled-pdf";
import type { PrehledSnapshotEntry } from "@/lib/export/prehled-template";
import {
  validatePrehledEntry,
  type PrehledStatus,
} from "@/lib/regulations/vbo-n/prehled";

async function requireNizsiOrg() {
  const session = await auth();

  if (!session.userId || !session.orgId) {
    throw new Error("Unauthorized.");
  }

  const organisation = await getOrganisationByClerkOrgId(session.orgId);

  if (organisation?.rezimPovinnosti !== "nizsi") {
    throw new Error("VBO-N is only available in the lower-obligations regime.");
  }

  return { organisation, session };
}

function getStringValue(formData: FormData, key: string): string | null {
  const value = formData.get(key);

  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export async function savePrehledEntryAction(formData: FormData) {
  const { session } = await requireNizsiOrg();

  const input = {
    baselineId: getStringValue(formData, "baselineId") ?? "",
    implementationNote: getStringValue(formData, "implementationNote"),
    justification: getStringValue(formData, "justification"),
    plannedDate: getStringValue(formData, "plannedDate"),
    priority: getStringValue(formData, "priority"),
    responsiblePerson: getStringValue(formData, "responsiblePerson"),
    status: getStringValue(formData, "status") ?? "",
  };

  // Hard validation: required fields per status; nezavedeno is rejected for
  // neopominutelné controls regardless of what the client submitted.
  const result = validatePrehledEntry(input);

  if (!result.ok) {
    throw new Error(result.errors.join(" "));
  }

  await upsertPrehledEntry({
    baselineId: input.baselineId,
    clerkOrgId: session.orgId!,
    implementationNote: result.status === "zavedeno" ? input.implementationNote : null,
    justification: result.status === "nezavedeno" ? input.justification : null,
    plannedDate: result.status === "planovano" ? input.plannedDate : null,
    priority: result.status === "planovano" ? input.priority : null,
    responsiblePerson:
      result.status === "planovano" ? input.responsiblePerson : null,
    status: result.status,
  });

  revalidatePath("/regulations/vbo-n/prehled");
  revalidatePath("/regulations/vbo-n");
}

export async function generatePrehledVersionAction() {
  const { organisation, session } = await requireNizsiOrg();

  const entries = await getPrehledEntries(session.orgId!);
  const snapshot: PrehledSnapshotEntry[] = entries.map((entry) => ({
    baselineId: entry.baselineId,
    implementationNote: entry.implementationNote,
    justification: entry.justification,
    plannedDate: entry.plannedDate,
    priority: entry.priority,
    responsiblePerson: entry.responsiblePerson,
    status: entry.status as PrehledStatus,
  }));

  const generatedAt = new Date();
  const versionNumber = await getNextPrehledVersionNumber(session.orgId!);
  const pdf = await renderPrehledPdf({
    entries: snapshot,
    generatedAt,
    ico: organisation?.ico ?? null,
    organisationName: organisation?.name ?? "",
    versionNumber,
  });

  const blob = await put(
    `prehled/${session.orgId}/v${versionNumber}-${generatedAt.getTime()}.pdf`,
    pdf,
    { access: "private", contentType: "application/pdf" },
  );

  await insertPrehledVersion({
    blobUrl: blob.url,
    clerkOrgId: session.orgId!,
    createdBy: session.userId,
    snapshot,
    versionNumber,
  });

  revalidatePath("/regulations/vbo-n/prehled");
}
