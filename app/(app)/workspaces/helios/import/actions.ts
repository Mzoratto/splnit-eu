"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { importHeliosCsvEvidence } from "@/lib/workspaces/helios-csv/importer";
import type { HeliosCsvFileKind, HeliosCsvImportResult } from "@/lib/workspaces/helios-csv/types";

const MAX_FILE_SIZE_BYTES = 512 * 1024;
const SUPPORTED_KINDS = new Set<HeliosCsvFileKind>(["users", "roles", "backups", "integrations"]);

export type HeliosCsvImportActionResult =
  | ({ ok: true } & HeliosCsvImportResult)
  | { error: string; ok: false };

function isSupportedKind(value: FormDataEntryValue | null): value is HeliosCsvFileKind {
  return typeof value === "string" && SUPPORTED_KINDS.has(value as HeliosCsvFileKind);
}

export async function importHeliosCsvAction(formData: FormData): Promise<HeliosCsvImportActionResult> {
  const session = await auth();
  if (!session.orgId) {
    return { error: "Import vyžaduje aktivní organizaci v Clerk.", ok: false };
  }

  const kindValue = formData.get("kind");
  if (!isSupportedKind(kindValue)) {
    return { error: "Select a supported Splnit CSV template.", ok: false };
  }

  const uploaded = formData.get("file");
  if (!(uploaded instanceof File)) {
    return { error: "Nahrajte CSV soubor vyplněný podle šablony Splnit.", ok: false };
  }

  const fileName = uploaded.name.toLowerCase();
  const mimeType = uploaded.type.toLowerCase();
  if (!fileName.endsWith(".csv") || (mimeType && !["text/csv", "application/csv", "application/vnd.ms-excel"].includes(mimeType))) {
    return { error: "Podporován je pouze soubor .csv ze šablony Splnit.", ok: false };
  }
  if (uploaded.size <= 0 || uploaded.size > MAX_FILE_SIZE_BYTES) {
    return { error: "CSV soubor musí být neprázdný a menší než 512 KB.", ok: false };
  }

  try {
    const csvText = await uploaded.text();
    const result = await importHeliosCsvEvidence({
      clerkOrgId: session.orgId,
      collectedBy: session.userId ?? "clerk_org_member",
      csvText,
      kind: kindValue,
    });
    revalidatePath("/workspaces/helios");
    revalidatePath("/workspaces/helios/import");
    revalidatePath("/evidence");
    return { ...result, ok: true };
  } catch {
    return {
      error: "Import se nepodařilo dokončit. Zkontrolujte šablonu a zkuste to znovu; detaily nejsou z bezpečnostních důvodů vypsány.",
      ok: false,
    };
  }
}
