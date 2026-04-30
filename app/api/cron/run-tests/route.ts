import { NextResponse } from "next/server";
import { hasDatabaseUrl } from "@/lib/db";
import { listActiveIntegrationTargets } from "@/lib/db/queries/integrations";
import { getCronAuthError } from "@/lib/http/cron";
import { inngest } from "@/inngest/client";

async function queueIntegrationRuns(request: Request, body: Record<string, unknown>) {
  const authError = getCronAuthError(request);
  if (authError) {
    return authError;
  }

  if (body.clerkOrgId) {
    await inngest.send({
      name: "integrations/tests.run",
      data: {
        clerkOrgId: String(body.clerkOrgId),
        provider: body.provider ? String(body.provider) : undefined,
      },
    });

    return NextResponse.json({
      ok: true,
      queued: 1,
    });
  }

  if (!hasDatabaseUrl()) {
    return NextResponse.json({
      ok: true,
      queued: 0,
      skipped: "DATABASE_URL is not configured.",
    });
  }

  const targets = await listActiveIntegrationTargets();
  const uniqueTargets = Array.from(
    new Map(
      targets.map((target) => [
        `${target.clerkOrgId}:${target.provider}`,
        target,
      ]),
    ).values(),
  );

  await Promise.all(
    uniqueTargets.map((target) =>
      inngest.send({
        name: "integrations/tests.run",
        data: {
          clerkOrgId: target.clerkOrgId,
          provider: target.provider,
        },
      }),
    ),
  );

  return NextResponse.json({
    ok: true,
    queued: uniqueTargets.length,
  });
}

export async function GET(request: Request) {
  return queueIntegrationRuns(request, {});
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return queueIntegrationRuns(request, body);
}
