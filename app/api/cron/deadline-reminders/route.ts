import { and, eq, inArray, isNotNull } from "drizzle-orm";
import { NextResponse } from "next/server";
import baseline from "@/lib/compliance/nukib/generated/baseline-current.json";
import { getDb } from "@/lib/db";
import {
  controls,
  frameworkControls,
  orgControlStatuses,
  organisations,
  profiles,
  reminderLog,
  subscriptions,
} from "@/lib/db/schema";
import { sendDeadlineReminder } from "@/lib/email/send";
import { getCronAuthError } from "@/lib/http/cron";

export const dynamic = "force-dynamic";

const REMINDER_DAYS = new Set([90, 30, 7]);
const mandatoryReferences = baseline.controls
  .filter((control) => control.tier === "mandatory_minimum" && !control.archived)
  .map((control) => control.exactReference);

function daysUntilDeadline(createdAt: Date | null) {
  if (!createdAt) {
    return null;
  }

  const deadline = new Date(createdAt);
  deadline.setUTCFullYear(deadline.getUTCFullYear() + 1);
  const todayUtc = Date.UTC(
    new Date().getUTCFullYear(),
    new Date().getUTCMonth(),
    new Date().getUTCDate(),
  );
  const deadlineUtc = Date.UTC(
    deadline.getUTCFullYear(),
    deadline.getUTCMonth(),
    deadline.getUTCDate(),
  );

  return Math.ceil((deadlineUtc - todayUtc) / 86_400_000);
}

async function getPrimaryContactEmail(clerkOrgId: string) {
  const db = getDb();
  const rows = await db
    .select({ email: profiles.email })
    .from(profiles)
    .where(and(eq(profiles.clerkOrgId, clerkOrgId), isNotNull(profiles.email)))
    .limit(1);

  return rows[0]?.email ?? null;
}

async function listControlsAtRisk(clerkOrgId: string) {
  const db = getDb();
  const rows = await db
    .select({
      reference: frameworkControls.articleRef,
      status: orgControlStatuses.status,
      title: controls.titleCs,
    })
    .from(frameworkControls)
    .innerJoin(controls, eq(frameworkControls.controlId, controls.id))
    .leftJoin(
      orgControlStatuses,
      and(
        eq(orgControlStatuses.controlId, controls.id),
        eq(orgControlStatuses.clerkOrgId, clerkOrgId),
      ),
    )
    .where(inArray(frameworkControls.articleRef, mandatoryReferences));

  return rows
    .filter((row) => row.status !== "pass")
    .map((row) => ({
      reference: row.reference ?? "",
      title: row.title,
    }));
}

async function markReminderSent(input: {
  clerkOrgId: string;
  reminderType: string;
}) {
  const db = getDb();
  const rows = await db
    .insert(reminderLog)
    .values(input)
    .onConflictDoNothing()
    .returning({ id: reminderLog.id });

  return Boolean(rows[0]);
}

async function sendDeadlineReminders() {
  const db = getDb();
  const activeSubscriptions = await db
    .select({
      clerkOrgId: subscriptions.clerkOrgId,
      orgCreatedAt: organisations.createdAt,
      orgName: organisations.name,
    })
    .from(subscriptions)
    .innerJoin(organisations, eq(subscriptions.clerkOrgId, organisations.clerkOrgId))
    .where(inArray(subscriptions.status, ["active", "trialing"]));
  let sent = 0;
  let skipped = 0;

  for (const subscription of activeSubscriptions) {
    const daysUntil = daysUntilDeadline(subscription.orgCreatedAt);

    if (!daysUntil || !REMINDER_DAYS.has(daysUntil)) {
      skipped += 1;
      continue;
    }

    const reminderType = `deadline_${daysUntil}d`;
    const [to, controlsAtRisk] = await Promise.all([
      getPrimaryContactEmail(subscription.clerkOrgId),
      listControlsAtRisk(subscription.clerkOrgId),
    ]);

    if (!to || controlsAtRisk.length === 0) {
      skipped += 1;
      continue;
    }

    const inserted = await markReminderSent({
      clerkOrgId: subscription.clerkOrgId,
      reminderType,
    });

    if (!inserted) {
      skipped += 1;
      continue;
    }

    await sendDeadlineReminder(to, {
      controlsAtRisk,
      daysUntil,
      orgName: subscription.orgName,
    });
    sent += 1;
  }

  return {
    checked: activeSubscriptions.length,
    sent,
    skipped,
  };
}

async function handleCron(request: Request) {
  const authError = getCronAuthError(request);

  if (authError) {
    return authError;
  }

  const result = await sendDeadlineReminders();

  return NextResponse.json({
    ok: true,
    ...result,
  });
}

export async function GET(request: Request) {
  return handleCron(request);
}

export async function POST(request: Request) {
  return handleCron(request);
}
