import { and, eq, gte, lt, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { organisations, trustCenters, vendorAssessments } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

type HealthResponse = {
  status: "ok" | "degraded";
  timestamp: string;
  checks: {
    db_connection: { status: "ok" | "fail" };
    recent_signups: { count: number };
    expired_vendor_tokens: { count: number };
    published_trust_centers: { count: number };
  };
};

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function noStoreHeaders() {
  return {
    "Cache-Control": "no-store, max-age=0",
    Pragma: "no-cache",
  };
}

function getCount(row: { count: number } | undefined) {
  return Number(row?.count ?? 0);
}

function isAuthorized(request: Request) {
  const internalToken = process.env.INTERNAL_HEALTH_TOKEN;
  const cronSecret = process.env.CRON_SECRET;

  if (
    internalToken &&
    request.headers.get("x-internal-token") === internalToken
  ) {
    return true;
  }

  return (
    Boolean(cronSecret) &&
    request.headers.get("authorization") === `Bearer ${cronSecret}`
  );
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return unauthorized();
  }

  if (process.env.NODE_ENV !== "production") {
    return NextResponse.json(
      { env: "non-production", status: "ok" },
      { headers: noStoreHeaders() },
    );
  }

  const timestamp = new Date().toISOString();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  let db: ReturnType<typeof getDb>;

  try {
    db = getDb();
    await db.execute(sql`select 1`);
  } catch {
    const degraded: HealthResponse = {
      status: "degraded",
      timestamp,
      checks: {
        db_connection: { status: "fail" },
        recent_signups: { count: 0 },
        expired_vendor_tokens: { count: 0 },
        published_trust_centers: { count: 0 },
      },
    };

    return NextResponse.json(degraded, {
      headers: noStoreHeaders(),
      status: 503,
    });
  }

  const [recentSignupRows, expiredVendorTokenRows, publishedTrustCenterRows] =
    await Promise.all([
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(organisations)
        .where(gte(organisations.createdAt, sevenDaysAgo)),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(vendorAssessments)
        .where(
          and(
            lt(vendorAssessments.expiresAt, new Date()),
            eq(vendorAssessments.status, "sent"),
          ),
        ),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(trustCenters)
        .where(eq(trustCenters.isPublic, true)),
    ]);

  const response: HealthResponse = {
    status: "ok",
    timestamp,
    checks: {
      db_connection: { status: "ok" },
      recent_signups: { count: getCount(recentSignupRows[0]) },
      expired_vendor_tokens: { count: getCount(expiredVendorTokenRows[0]) },
      published_trust_centers: { count: getCount(publishedTrustCenterRows[0]) },
    },
  };

  return NextResponse.json(response, { headers: noStoreHeaders() });
}
