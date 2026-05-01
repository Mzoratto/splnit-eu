import { auth } from "@clerk/nextjs/server";
import { hasDatabaseUrl } from "@/lib/db";
import {
  listAuditLogPage,
  MAX_AUDIT_LOG_EXPORT_LIMIT,
  type AuditLogCursor,
} from "@/lib/db/queries/audit-logs";
import { privateJson, withPrivateNoStore } from "@/lib/http/private-response";

export const dynamic = "force-dynamic";

const DEFAULT_AUDIT_LOG_EXPORT_LIMIT = 1000;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function hasClerkConfig() {
  return (
    Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
    Boolean(process.env.CLERK_SECRET_KEY)
  );
}

function parseDateParam(
  value: string | null,
  boundary: "start" | "end",
): { date?: Date; error?: string } {
  if (!value) {
    return { date: undefined };
  }

  const normalized =
    /^\d{4}-\d{2}-\d{2}$/.test(value) && boundary === "start"
      ? `${value}T00:00:00.000Z`
      : /^\d{4}-\d{2}-\d{2}$/.test(value)
        ? `${value}T23:59:59.999Z`
        : value;
  const date = new Date(normalized);

  if (Number.isNaN(date.getTime())) {
    return { error: `Invalid ${boundary === "start" ? "from" : "to"} date.` };
  }

  return { date };
}

function parseLimitParam(value: string | null): {
  error?: string;
  limit?: number;
} {
  if (!value) {
    return { limit: DEFAULT_AUDIT_LOG_EXPORT_LIMIT };
  }

  const limit = Number(value);

  if (
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > MAX_AUDIT_LOG_EXPORT_LIMIT
  ) {
    return {
      error: `Invalid limit. Use a value from 1 to ${MAX_AUDIT_LOG_EXPORT_LIMIT}.`,
    };
  }

  return { limit };
}

function encodeCursor(cursor: AuditLogCursor) {
  return Buffer.from(
    JSON.stringify({
      createdAt: cursor.createdAt.toISOString(),
      id: cursor.id,
    }),
  ).toString("base64url");
}

function parseCursorParam(value: string | null): {
  cursor?: AuditLogCursor;
  error?: string;
} {
  if (!value) {
    return { cursor: undefined };
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(value, "base64url").toString("utf8"),
    ) as {
      createdAt?: unknown;
      id?: unknown;
    };

    if (typeof parsed.createdAt !== "string" || typeof parsed.id !== "string") {
      return { error: "Invalid cursor." };
    }

    const createdAt = new Date(parsed.createdAt);

    if (Number.isNaN(createdAt.getTime()) || !UUID_PATTERN.test(parsed.id)) {
      return { error: "Invalid cursor." };
    }

    return {
      cursor: {
        createdAt,
        id: parsed.id,
      },
    };
  } catch {
    return { error: "Invalid cursor." };
  }
}

function escapeCsvValue(value: unknown) {
  const text =
    value instanceof Date
      ? value.toISOString()
      : typeof value === "object" && value !== null
        ? JSON.stringify(value)
        : String(value ?? "");

  return `"${text.replace(/"/g, '""')}"`;
}

function getCsvFilename() {
  const date = new Date().toISOString().slice(0, 10);
  return `audit-log-${date}.csv`;
}

export async function GET(request: Request) {
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

  const url = new URL(request.url);
  const from = parseDateParam(url.searchParams.get("from"), "start");
  const to = parseDateParam(url.searchParams.get("to"), "end");
  const limit = parseLimitParam(url.searchParams.get("limit"));
  const cursor = parseCursorParam(url.searchParams.get("cursor"));

  if (from.error || to.error || limit.error || cursor.error) {
    return privateJson(
      { error: from.error ?? to.error ?? limit.error ?? cursor.error },
      { status: 400 },
    );
  }

  if (from.date && to.date && from.date > to.date) {
    return privateJson(
      { error: "Invalid date range. The from date must be before the to date." },
      { status: 400 },
    );
  }

  const page = await listAuditLogPage({
    action: url.searchParams.get("action") || undefined,
    clerkOrgId: session.orgId,
    cursor: cursor.cursor,
    entityType: url.searchParams.get("entityType") || undefined,
    from: from.date,
    limit: limit.limit,
    to: to.date,
  });
  const header = [
    "created_at",
    "clerk_org_id",
    "clerk_user_id",
    "action",
    "entity_type",
    "entity_id",
    "metadata",
  ];
  const body = page.rows.map((row) =>
    [
      row.createdAt,
      row.clerkOrgId,
      row.clerkUserId,
      row.action,
      row.entityType,
      row.entityId,
      row.metadata,
    ]
      .map(escapeCsvValue)
      .join(","),
  );
  const csv = [header.join(","), ...body].join("\n");

  return new Response(csv, {
    headers: withPrivateNoStore({
      "Content-Disposition": `attachment; filename="${getCsvFilename()}"`,
      "Content-Type": "text/csv; charset=utf-8",
      ...(page.nextCursor
        ? {
            "X-Audit-Log-Next-Cursor": encodeCursor(page.nextCursor),
            "X-Audit-Log-Truncated": "true",
          }
        : {
            "X-Audit-Log-Truncated": "false",
          }),
    }),
  });
}
