import { and, desc, eq, gte, lt, lte, or, type SQL } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { auditLogs } from "@/lib/db/schema";

export const MAX_AUDIT_LOG_EXPORT_LIMIT = 5000;

export type AuditLogCursor = {
  createdAt: Date;
  id: string;
};

export type AuditLogFilters = {
  action?: string;
  clerkOrgId: string;
  cursor?: AuditLogCursor;
  entityType?: string;
  from?: Date;
  limit?: number;
  to?: Date;
};

function buildAuditLogFilters(input: AuditLogFilters) {
  const filters: SQL[] = [eq(auditLogs.clerkOrgId, input.clerkOrgId)];

  if (input.action) {
    filters.push(eq(auditLogs.action, input.action));
  }

  if (input.entityType) {
    filters.push(eq(auditLogs.entityType, input.entityType));
  }

  if (input.from) {
    filters.push(gte(auditLogs.createdAt, input.from));
  }

  if (input.to) {
    filters.push(lte(auditLogs.createdAt, input.to));
  }

  if (input.cursor) {
    const cursorFilter = or(
      lt(auditLogs.createdAt, input.cursor.createdAt),
      and(
        eq(auditLogs.createdAt, input.cursor.createdAt),
        lt(auditLogs.id, input.cursor.id),
      ),
    );

    if (cursorFilter) {
      filters.push(cursorFilter);
    }
  }

  return and(...filters);
}

function clampAuditLogLimit(limit: number | undefined, fallback: number) {
  if (!limit) {
    return fallback;
  }

  return Math.min(Math.max(limit, 1), MAX_AUDIT_LOG_EXPORT_LIMIT);
}

export async function createAuditLog(input: {
  action: string;
  clerkOrgId: string;
  clerkUserId?: string | null;
  entityId: string;
  entityType: string;
  metadata?: Record<string, unknown>;
}) {
  const db = getDb();

  await db.insert(auditLogs).values({
    action: input.action,
    clerkOrgId: input.clerkOrgId,
    clerkUserId: input.clerkUserId ?? null,
    entityId: input.entityId,
    entityType: input.entityType,
    metadata: input.metadata ?? {},
  });
}

export async function listAuditLogs(input: AuditLogFilters) {
  const db = getDb();

  return db
    .select()
    .from(auditLogs)
    .where(buildAuditLogFilters(input))
    .orderBy(desc(auditLogs.createdAt), desc(auditLogs.id))
    .limit(clampAuditLogLimit(input.limit, 100));
}

export async function listAuditLogPage(input: AuditLogFilters) {
  const limit = clampAuditLogLimit(input.limit, 1000);
  const db = getDb();

  const rows = await db
    .select()
    .from(auditLogs)
    .where(buildAuditLogFilters(input))
    .orderBy(desc(auditLogs.createdAt), desc(auditLogs.id))
    .limit(limit + 1);

  const pageRows = rows.slice(0, limit);
  const lastRow = pageRows[pageRows.length - 1];

  return {
    nextCursor:
      rows.length > limit && lastRow?.createdAt
        ? {
            createdAt: lastRow.createdAt,
            id: lastRow.id,
          }
        : null,
    rows: pageRows,
  };
}
