import { and, desc, eq, type SQL } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { auditLogs } from "@/lib/db/schema";

export type AuditLogFilters = {
  action?: string;
  clerkOrgId: string;
  entityType?: string;
  limit?: number;
};

function buildAuditLogFilters(input: AuditLogFilters) {
  const filters: SQL[] = [eq(auditLogs.clerkOrgId, input.clerkOrgId)];

  if (input.action) {
    filters.push(eq(auditLogs.action, input.action));
  }

  if (input.entityType) {
    filters.push(eq(auditLogs.entityType, input.entityType));
  }

  return and(...filters);
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
    .orderBy(desc(auditLogs.createdAt))
    .limit(Math.min(input.limit ?? 100, 1000));
}
