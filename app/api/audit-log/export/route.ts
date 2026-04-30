import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { listAuditLogs } from "@/lib/db/queries/audit-logs";

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
  const session = await auth();

  if (!session.userId || !session.orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const rows = await listAuditLogs({
    action: url.searchParams.get("action") || undefined,
    clerkOrgId: session.orgId,
    entityType: url.searchParams.get("entityType") || undefined,
    limit: 1000,
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
  const body = rows.map((row) =>
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
    headers: {
      "Content-Disposition": `attachment; filename="${getCsvFilename()}"`,
      "Content-Type": "text/csv; charset=utf-8",
    },
  });
}
