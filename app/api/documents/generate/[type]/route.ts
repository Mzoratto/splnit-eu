import { auth } from "@clerk/nextjs/server";
import { hasDatabaseUrl } from "@/lib/db";
import {
  generateGapAnalysisXLSX,
  generateSoAXLSX,
  generateVendorReportXLSX,
} from "@/lib/documents/generators";
import {
  getGapAnalysisData,
  getOrgDocumentMetadata,
  getSoAData,
  getVendorReportData,
} from "@/lib/documents/queries";
import { FLAGS, isFeatureEnabled } from "@/lib/features/flags";
import { privateJson, withPrivateNoStore } from "@/lib/http/private-response";

export const dynamic = "force-dynamic";

const SPREADSHEET_CONTENT_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
const DOCUMENT_TYPES = ["gap-analysis", "soa-iso27001", "vendor-report"] as const;
const FRAMEWORK_SLUGS = ["nis2", "gdpr", "ai-act", "iso27001"] as const;

type DocumentType = (typeof DOCUMENT_TYPES)[number];
type FrameworkSlug = (typeof FRAMEWORK_SLUGS)[number];

function isDocumentType(value: string): value is DocumentType {
  return DOCUMENT_TYPES.includes(value as DocumentType);
}

function isFrameworkSlug(value: string | null): value is FrameworkSlug {
  return FRAMEWORK_SLUGS.includes(value as FrameworkSlug);
}

function filenamePart(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "organisation";
}

function responseFromBuffer(buffer: Buffer, filename: string) {
  const body = new ArrayBuffer(buffer.byteLength);
  new Uint8Array(body).set(buffer);

  return new Response(body, {
    headers: withPrivateNoStore({
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Type": SPREADSHEET_CONTENT_TYPE,
    }),
  });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ type: string }> },
) {
  const { type } = await params;

  if (!isDocumentType(type)) {
    return privateJson({ error: "Unsupported document type." }, { status: 404 });
  }

  const clerkConfigured =
    Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
    Boolean(process.env.CLERK_SECRET_KEY);

  if (!clerkConfigured) {
    return privateJson(
      { error: "Clerk authentication is required." },
      { status: 401 },
    );
  }

  const session = await auth();
  if (!session.userId || !session.orgId) {
    return privateJson({ error: "Unauthorized." }, { status: 401 });
  }

  if (!hasDatabaseUrl()) {
    return privateJson(
      { error: "DATABASE_URL is required." },
      { status: 503 },
    );
  }

  const enabled = await isFeatureEnabled(
    session.orgId,
    FLAGS.SMART_DOCUMENT_GENERATION,
  );

  if (!enabled) {
    return privateJson(
      { error: "Smart document generation is not enabled for this organisation." },
      { status: 403 },
    );
  }

  const generatedAt = new Date();
  const generatedDate = generatedAt.toISOString().slice(0, 10);
  const meta = await getOrgDocumentMetadata(session.orgId);
  const orgSlug = filenamePart(meta.name);
  const url = new URL(request.url);
  let buffer: Buffer;

  if (type === "gap-analysis") {
    const framework = url.searchParams.get("framework");

    if (!isFrameworkSlug(framework)) {
      return privateJson(
        { error: "Missing or invalid framework query parameter." },
        { status: 400 },
      );
    }

    const rows = await getGapAnalysisData(session.orgId, framework);
    buffer = generateGapAnalysisXLSX({
      frameworkSlug: framework,
      meta,
      rows,
    });
  } else if (type === "soa-iso27001") {
    const data = await getSoAData(session.orgId);
    buffer = generateSoAXLSX({ data, meta });
  } else {
    const rows = await getVendorReportData(session.orgId);
    buffer = generateVendorReportXLSX({ meta, rows });
  }

  return responseFromBuffer(
    buffer,
    `${type}-${orgSlug}-${generatedDate}.xlsx`,
  );
}
