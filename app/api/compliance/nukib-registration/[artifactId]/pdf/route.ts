import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import {
  NUKIB_REGISTRATION_KIND,
  parseNukibRegistrationContent,
} from "@/lib/compliance/nukib/registration-artifact";
import { getGeneratedArtifactForOrg } from "@/lib/db/queries/generated-artifacts";
import { privateJson, withPrivateNoStore } from "@/lib/http/private-response";
import { renderNukibRegistrationPdf } from "@/lib/pdf/nukib-registration";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function hasClerkConfig() {
  return (
    Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
    Boolean(process.env.CLERK_SECRET_KEY)
  );
}

function slugifyFilenamePart(value: string) {
  const slug = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "organizace";
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ artifactId: string }> },
) {
  if (!hasClerkConfig()) {
    return privateJson({ error: "Unauthorized" }, { status: 401 });
  }

  const session = await auth();

  if (!session?.userId || !session.orgId) {
    return privateJson({ error: "Unauthorized" }, { status: 401 });
  }

  const { artifactId } = await params;

  if (!z.string().uuid().safeParse(artifactId).success) {
    return privateJson({ error: "Invalid artifact id" }, { status: 400 });
  }

  const artifact = await getGeneratedArtifactForOrg({
    artifactId,
    clerkOrgId: session.orgId,
    kind: NUKIB_REGISTRATION_KIND,
  });

  if (!artifact) {
    return privateJson({ error: "Forbidden" }, { status: 403 });
  }

  const registration = parseNukibRegistrationContent(artifact.content);
  const pdf = await renderNukibRegistrationPdf(registration);
  const orgSlug = slugifyFilenamePart(registration.organisationName);

  return new Response(new Uint8Array(pdf), {
    headers: withPrivateNoStore({
      "Content-Disposition": `attachment; filename="nukib-registrace-${orgSlug}.pdf"`,
      "Content-Type": "application/pdf",
    }),
  });
}
