import JSZip from "jszip";
import { auth } from "@clerk/nextjs/server";
import { get } from "@vercel/blob";
import { hasDatabaseUrl } from "@/lib/db";
import {
  listEvidenceArchiveFiles,
  listEvidenceMetadataForExport,
  type EvidenceArchiveFile,
} from "@/lib/db/queries/evidence";
import {
  listPolicyArchiveFiles,
  type PolicyArchiveFile,
} from "@/lib/db/queries/policies";
import { getWorkspaceExport } from "@/lib/db/queries/workspace-export";
import { renderEvidenceMetadataCsv } from "@/lib/exports/evidence-metadata";
import { privateJson, withPrivateNoStore } from "@/lib/http/private-response";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type ArchiveFileResult = {
  contentType?: string;
  id: string;
  kind: "evidence" | "policy";
  path?: string;
  reason?: string;
  sizeBytes?: number;
};

function hasClerkConfig() {
  return (
    Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
    Boolean(process.env.CLERK_SECRET_KEY)
  );
}

function getFilename() {
  const date = new Date().toISOString().slice(0, 10);
  return `workspace-export-${date}.zip`;
}

function slugify(value: string | null | undefined, fallback: string) {
  const slug = (value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return slug || fallback;
}

function getExtension(contentType: string) {
  const normalized = contentType.split(";")[0]?.trim().toLowerCase();
  const extensionByType: Record<string, string> = {
    "application/json": "json",
    "application/pdf": "pdf",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      "pptx",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      "docx",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
    "application/zip": "zip",
    "image/gif": "gif",
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "text/html": "html",
    "text/csv": "csv",
    "text/plain": "txt",
  };

  return normalized ? extensionByType[normalized] ?? "bin" : "bin";
}

function getEvidenceArchivePath(
  file: EvidenceArchiveFile,
  contentType: string,
) {
  const base = slugify(
    file.description || file.source || `evidence-${file.evidenceId.slice(0, 8)}`,
    "evidence",
  );
  const control = slugify(file.controlKey, "control");

  return `evidence-files/${control}/${base}-${file.evidenceId.slice(
    0,
    8,
  )}.${getExtension(contentType)}`;
}

function getPolicyArchivePath(file: PolicyArchiveFile, contentType: string) {
  const type = slugify(file.type, "policy");
  const title = slugify(file.title, "policy");

  return `policy-files/${type}/${title}-v${file.version}-${file.policyId.slice(
    0,
    8,
  )}.${getExtension(contentType)}`;
}

async function addBlobToArchive(
  zip: JSZip,
  input:
    | { file: EvidenceArchiveFile; kind: "evidence" }
    | { file: PolicyArchiveFile; kind: "policy" },
): Promise<ArchiveFileResult> {
  try {
    const blob = await get(input.file.blobUrl, { access: "private" });

    if (!blob || blob.statusCode !== 200) {
      return {
        id:
          input.kind === "evidence"
            ? input.file.evidenceId
            : input.file.policyId,
        kind: input.kind,
        reason: "Blob file not found.",
      };
    }

    const contentType = blob.blob.contentType || "application/octet-stream";
    const data = await new Response(blob.stream).arrayBuffer();
    const path =
      input.kind === "evidence"
        ? getEvidenceArchivePath(input.file, contentType)
        : getPolicyArchivePath(input.file, contentType);

    zip.file(path, data);

    return {
      contentType,
      id:
        input.kind === "evidence" ? input.file.evidenceId : input.file.policyId,
      kind: input.kind,
      path,
      sizeBytes: data.byteLength,
    };
  } catch (error) {
    return {
      id: input.kind === "evidence" ? input.file.evidenceId : input.file.policyId,
      kind: input.kind,
      reason: error instanceof Error ? error.message : "Blob fetch failed.",
    };
  }
}

export async function GET() {
  if (!hasClerkConfig()) {
    return privateJson({ error: "Unauthorized" }, { status: 401 });
  }

  const session = await auth();

  if (!session.userId || !session.orgId) {
    return privateJson({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasDatabaseUrl()) {
    return privateJson(
      { error: "DATABASE_URL is required." },
      { status: 503 },
    );
  }

  const [workspaceExport, evidenceMetadata, evidenceFiles, policyFiles] =
    await Promise.all([
      getWorkspaceExport(session.orgId),
      listEvidenceMetadataForExport(session.orgId),
      listEvidenceArchiveFiles(session.orgId),
      listPolicyArchiveFiles(session.orgId),
    ]);

  if (!workspaceExport) {
    return privateJson({ error: "Organisation not found." }, { status: 404 });
  }

  if (
    (evidenceFiles.length > 0 || policyFiles.length > 0) &&
    !process.env.BLOB_READ_WRITE_TOKEN
  ) {
    return privateJson(
      { error: "BLOB_READ_WRITE_TOKEN is required to build file archives." },
      { status: 503 },
    );
  }

  const zip = new JSZip();
  zip.file("workspace-export.json", `${JSON.stringify(workspaceExport, null, 2)}\n`);
  zip.file("evidence-metadata.csv", `${renderEvidenceMetadataCsv(evidenceMetadata)}\n`);

  const fileResults: ArchiveFileResult[] = [];

  for (const file of evidenceFiles) {
    fileResults.push(await addBlobToArchive(zip, { file, kind: "evidence" }));
  }

  for (const file of policyFiles) {
    fileResults.push(await addBlobToArchive(zip, { file, kind: "policy" }));
  }

  zip.file(
    "export-manifest.json",
    `${JSON.stringify(
      {
        archiveVersion: 1,
        exportedAt: new Date().toISOString(),
        includedFiles: fileResults.filter((result) => result.path),
        missingFiles: fileResults.filter((result) => !result.path),
        redactions: workspaceExport.redactions,
      },
      null,
      2,
    )}\n`,
  );

  const archive = await zip.generateAsync({
    compression: "DEFLATE",
    type: "arraybuffer",
  });

  return new Response(archive, {
    headers: withPrivateNoStore({
      "Content-Disposition": `attachment; filename="${getFilename()}"`,
      "Content-Type": "application/zip",
    }),
  });
}
