import { and, desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  buildNukibRegistrationArtifact,
  NUKIB_REGISTRATION_KIND,
  parseNukibRegistrationContent,
} from "@/lib/compliance/nukib/registration-artifact";
import { getNukibRegistrationApiSession } from "@/lib/compliance/nukib/registration-api-session";
import {
  NUKIB_REGISTRATION_LEGAL_BASIS,
  NukibRegistrationSchema,
} from "@/lib/compliance/nukib/registration-schema";
import {
  createNukibRegistrationTestArtifact,
  getLatestNukibRegistrationTestArtifact,
} from "@/lib/compliance/nukib/registration-test-store";
import { getDb } from "@/lib/db";
import { generatedArtifacts } from "@/lib/db/schema";
import { privateJson } from "@/lib/http/private-response";

export const dynamic = "force-dynamic";

function validationError(error: z.ZodError) {
  return privateJson(
    {
      error: "Invalid NÚKIB registration payload",
      issues: z.flattenError(error),
    },
    { status: 400 },
  );
}

export async function POST(request: Request) {
  const session = await getNukibRegistrationApiSession(request);

  if (!session) {
    return privateJson({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return privateJson({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = NukibRegistrationSchema.safeParse({
    ...body,
    legalBasis: NUKIB_REGISTRATION_LEGAL_BASIS,
    preparedAt: new Date().toISOString(),
    preparedBy: session.userId,
  });

  if (!parsed.success) {
    return validationError(parsed.error);
  }

  if (session.mode === "test") {
    const artifact = createNukibRegistrationTestArtifact({
      clerkOrgId: session.orgId,
      createdBy: session.userId,
      data: parsed.data,
    });

    return NextResponse.json({ id: artifact.id });
  }

  const artifact = await buildNukibRegistrationArtifact(
    session.orgId,
    parsed.data,
    session.userId,
  );

  return NextResponse.json(artifact);
}

export async function GET(request: Request) {
  const session = await getNukibRegistrationApiSession(request);

  if (!session) {
    return privateJson({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.mode === "test") {
    const artifact = getLatestNukibRegistrationTestArtifact(session.orgId);

    if (!artifact) {
      return privateJson(
        { error: "NÚKIB registration artifact not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      content: artifact.content,
      createdAt: artifact.createdAt,
      id: artifact.id,
      title: artifact.title,
    });
  }

  const db = getDb();
  const rows = await db
    .select()
    .from(generatedArtifacts)
    .where(
      and(
        eq(generatedArtifacts.clerkOrgId, session.orgId),
        eq(generatedArtifacts.kind, NUKIB_REGISTRATION_KIND),
      ),
    )
    .orderBy(desc(generatedArtifacts.createdAt))
    .limit(1);

  const artifact = rows[0] ?? null;

  if (!artifact) {
    return privateJson({ error: "NÚKIB registration artifact not found" }, { status: 404 });
  }

  return NextResponse.json({
    content: parseNukibRegistrationContent(artifact.content),
    createdAt: artifact.createdAt,
    id: artifact.id,
    title: artifact.title,
  });
}
