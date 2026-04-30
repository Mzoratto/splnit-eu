"use server";

import { auth } from "@clerk/nextjs/server";
import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { updateControlStatus } from "@/lib/db/queries/controls";
import { createManualEvidence } from "@/lib/db/queries/evidence";

const statusSchema = z.enum([
  "unknown",
  "pass",
  "fail",
  "manual_review",
  "not_applicable",
]);

const controlStatusSchema = z.object({
  notes: z.string().trim().max(4000).optional(),
  status: statusSchema,
});

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function sanitizeFilename(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}

async function getActiveSession() {
  const session = await auth();

  if (!session.userId || !session.orgId) {
    throw new Error("Active Clerk organisation is required.");
  }

  return {
    clerkOrgId: session.orgId,
    userId: session.userId,
  };
}

export async function updateControlStatusAction(
  controlKey: string,
  formData: FormData,
) {
  const parsed = controlStatusSchema.parse({
    notes: getStringValue(formData, "notes"),
    status: getStringValue(formData, "status"),
  });
  const session = await getActiveSession();

  await updateControlStatus({
    clerkOrgId: session.clerkOrgId,
    controlKey,
    notes: parsed.notes || null,
    status: parsed.status,
  });

  revalidatePath("/dashboard");
  revalidatePath("/evidence");
  revalidatePath(`/controls/${controlKey}`);
}

export async function uploadEvidenceAction(
  controlKey: string,
  formData: FormData,
) {
  const session = await getActiveSession();
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Evidence file is required.");
  }

  if (file.size > 10 * 1024 * 1024) {
    throw new Error("Evidence file must be 10 MB or smaller.");
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("BLOB_READ_WRITE_TOKEN is required to upload evidence.");
  }

  const description = getStringValue(formData, "description").trim();
  const expiresAt = getStringValue(formData, "expiresAt").trim();
  const source = getStringValue(formData, "source").trim();
  const safeName = sanitizeFilename(file.name) || "evidence-file";
  const uploadedAt = Date.now();
  const blob = await put(
    `evidence/${session.clerkOrgId}/${controlKey}/${uploadedAt}-${safeName}`,
    file,
    {
      access: "private",
      contentType: file.type || "application/octet-stream",
    },
  );

  await createManualEvidence({
    blobUrl: blob.url,
    clerkOrgId: session.clerkOrgId,
    collectedBy: session.userId,
    controlKey,
    description: description || null,
    expiresAt: expiresAt || null,
    fileType: file.type || "application/octet-stream",
    source: source || "manual_upload",
  });

  revalidatePath("/dashboard");
  revalidatePath("/evidence");
  revalidatePath(`/controls/${controlKey}`);
}
