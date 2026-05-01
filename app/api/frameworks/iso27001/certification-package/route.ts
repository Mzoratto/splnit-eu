import JSZip from "jszip";
import { auth } from "@clerk/nextjs/server";
import { hasDatabaseUrl } from "@/lib/db";
import { getIso27001CertificationPackage } from "@/lib/db/queries/certification-package";
import { ISO27001_CERTIFICATION_BODIES } from "@/lib/frameworks/iso27001-annex-a";
import { privateJson, withPrivateNoStore } from "@/lib/http/private-response";

export const dynamic = "force-dynamic";

function addJson(zip: JSZip, path: string, value: unknown) {
  zip.file(`${path}.json`, `${JSON.stringify(value, null, 2)}\n`);
}

export async function GET() {
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

  const data = await getIso27001CertificationPackage(session.orgId);
  const generatedAt = new Date();
  const passingRows = data.statementOfApplicability.filter(
    (row) => row.status === "pass",
  );
  const zip = new JSZip();

  addJson(zip, "manifest", {
    certificationBodies: ISO27001_CERTIFICATION_BODIES,
    evidenceCount: data.evidence.length,
    framework: data.framework.nameCs,
    generatedAt: generatedAt.toISOString(),
    organisationName: data.organisation?.name ?? session.orgId,
    passingControls: passingRows.length,
    policies: data.policies.length,
    totalAnnexControls: data.statementOfApplicability.length,
  });
  addJson(zip, "statement-of-applicability", data.statementOfApplicability);
  addJson(zip, "policies", data.policies);
  addJson(zip, "evidence", data.evidence);
  addJson(zip, "certification-bodies", ISO27001_CERTIFICATION_BODIES);

  for (const row of passingRows) {
    const evidenceRows = data.evidence.filter(
      (item) => item.controlId === row.controlId,
    );

    addJson(zip, `passing-controls/${row.articleRef}-${row.controlKey}`, {
      ...row,
      evidence: evidenceRows,
    });
  }

  const content = await zip.generateAsync({ type: "uint8array" });
  const body = new ArrayBuffer(content.byteLength);
  new Uint8Array(body).set(content);
  const filename = `iso27001-certification-package-${generatedAt
    .toISOString()
    .slice(0, 10)}.zip`;

  return new Response(body, {
    headers: withPrivateNoStore({
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Type": "application/zip",
    }),
  });
}
