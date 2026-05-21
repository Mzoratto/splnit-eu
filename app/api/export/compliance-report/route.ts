import { auth } from "@clerk/nextjs/server";
import { hasDatabaseUrl } from "@/lib/db";
import { getOrgWithEvidence } from "@/lib/db/queries/export";
import {
  getComplianceReportFilename,
  renderComplianceReportPdf,
} from "@/lib/export/pdf";
import { privateJson, withPrivateNoStore } from "@/lib/http/private-response";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const GENERATION_INTERVAL_MS = 60_000;
const generationTimestamps = new Map<string, number>();

function hasClerkConfig() {
  return (
    Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
    Boolean(process.env.CLERK_SECRET_KEY)
  );
}

function missingIdentityFields(ctx: Awaited<ReturnType<typeof getOrgWithEvidence>>) {
  return [
    !ctx.org.ico && "IČO",
    !ctx.org.dic && "DIČ",
    !ctx.org.sidlo && "Sídlo",
  ].filter((field): field is string => Boolean(field));
}

export async function GET(request: Request) {
  if (!hasClerkConfig()) {
    return privateJson({ error: "Nejste přihlášeni." }, { status: 401 });
  }

  const session = await auth();

  if (!session.userId || !session.orgId) {
    return privateJson({ error: "Nejste přihlášeni." }, { status: 401 });
  }

  if (!hasDatabaseUrl()) {
    return privateJson(
      { error: "Databáze není nakonfigurována." },
      { status: 503 },
    );
  }

  const url = new URL(request.url);
  const orgId = url.searchParams.get("orgId");

  if (!orgId) {
    return privateJson({ error: "Chybí identifikátor organizace." }, { status: 400 });
  }

  if (orgId !== session.orgId) {
    return privateJson({ error: "K této organizaci nemáte přístup." }, { status: 403 });
  }

  const now = Date.now();
  const lastGeneratedAt = generationTimestamps.get(orgId) ?? 0;

  if (now - lastGeneratedAt < GENERATION_INTERVAL_MS) {
    return privateJson(
      { error: "Příliš mnoho požadavků. Zkuste to za minutu." },
      { status: 429 },
    );
  }

  generationTimestamps.set(orgId, now);

  try {
    const ctx = await getOrgWithEvidence(orgId);
    const missingFields = missingIdentityFields(ctx);

    if (missingFields.length > 0) {
      generationTimestamps.delete(orgId);

      return privateJson(
        { error: `Před exportem vyplňte: ${missingFields.join(", ")}.` },
        { status: 422 },
      );
    }

    const ico = ctx.org.ico;

    if (!ico) {
      generationTimestamps.delete(orgId);

      return privateJson(
        { error: "Před exportem vyplňte: IČO." },
        { status: 422 },
      );
    }

    const pdf = await renderComplianceReportPdf(ctx);
    const filename = getComplianceReportFilename(ico, ctx.generatedAt);

    return new Response(new Uint8Array(pdf), {
      headers: withPrivateNoStore({
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Type": "application/pdf",
      }),
    });
  } catch (error) {
    generationTimestamps.delete(orgId);

    if (error instanceof Error && error.message === "Organisation not found.") {
      return privateJson({ error: "Organizace nebyla nalezena." }, { status: 404 });
    }

    throw error;
  }
}
