import { z } from "zod";
import { getNukibRegistrationApiSession } from "@/lib/compliance/nukib/registration-api-session";
import type { NukibRegistration } from "@/lib/compliance/nukib/registration-schema";
import {
  NUKIB_REGISTRATION_KIND,
  parseNukibRegistrationContent,
} from "@/lib/compliance/nukib/registration-artifact";
import { getNukibRegistrationTestArtifact } from "@/lib/compliance/nukib/registration-test-store";
import { getGeneratedArtifactForOrg } from "@/lib/db/queries/generated-artifacts";
import { privateJson, withPrivateNoStore } from "@/lib/http/private-response";
import { renderNukibRegistrationPdf } from "@/lib/pdf/nukib-registration";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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
  const session = await getNukibRegistrationApiSession();

  if (!session) {
    return privateJson({ error: "Unauthorized" }, { status: 401 });
  }

  const { artifactId } = await params;

  if (!z.string().uuid().safeParse(artifactId).success) {
    return privateJson({ error: "Invalid artifact id" }, { status: 400 });
  }

  let registration: NukibRegistration | null = null;

  if (session.mode === "test") {
    registration =
      getNukibRegistrationTestArtifact({
        artifactId,
        clerkOrgId: session.orgId,
      })?.content ?? null;
  } else {
    const artifact = await getGeneratedArtifactForOrg({
      artifactId,
      clerkOrgId: session.orgId,
      kind: NUKIB_REGISTRATION_KIND,
    });

    registration = artifact
      ? parseNukibRegistrationContent(artifact.content)
      : null;
  }

  if (!registration) {
    return privateJson({ error: "Forbidden" }, { status: 403 });
  }
  const pdf = await renderNukibRegistrationPdf(registration);
  const orgSlug = slugifyFilenamePart(registration.organisationName);

  return new Response(new Uint8Array(pdf), {
    headers: withPrivateNoStore({
      "Content-Disposition": `attachment; filename="nukib-registrace-${orgSlug}.pdf"`,
      "Content-Type": "application/pdf",
    }),
  });
}
