"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  createIncident,
  markIncidentReported,
  updateIncidentStatus,
} from "@/lib/db/queries/incidents";

const incidentSchema = z.object({
  affectsCriticalSystems: z.boolean(),
  affectsPersonalData: z.boolean(),
  description: z.string().trim().max(2000).optional(),
  detectedAt: z.string().min(1),
  severity: z.enum(["low", "medium", "high", "critical"]),
  title: z.string().trim().min(3).max(180),
});
const statusSchema = z.enum(["open", "investigating", "contained", "resolved"]);
const regulatorSchema = z.enum(["nukib", "uoou"]);

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function getBooleanValue(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

async function requireActiveSession() {
  const session = await auth();

  if (!session.userId || !session.orgId) {
    redirect("/sign-in");
  }

  return {
    clerkOrgId: session.orgId,
  };
}

export async function createIncidentAction(formData: FormData) {
  const session = await requireActiveSession();
  const parsed = incidentSchema.parse({
    affectsCriticalSystems: getBooleanValue(formData, "affectsCriticalSystems"),
    affectsPersonalData: getBooleanValue(formData, "affectsPersonalData"),
    description: getStringValue(formData, "description"),
    detectedAt: getStringValue(formData, "detectedAt"),
    severity: getStringValue(formData, "severity"),
    title: getStringValue(formData, "title"),
  });
  const incident = await createIncident({
    affectsCriticalSystems: parsed.affectsCriticalSystems,
    affectsPersonalData: parsed.affectsPersonalData,
    clerkOrgId: session.clerkOrgId,
    description: parsed.description || null,
    detectedAt: new Date(parsed.detectedAt),
    severity: parsed.severity,
    title: parsed.title,
  });

  if (!incident) {
    throw new Error("Incident could not be created.");
  }

  revalidatePath("/incidents");
  redirect(`/incidents?incidentId=${incident.id}`);
}

export async function updateIncidentStatusAction(
  incidentId: string,
  formData: FormData,
) {
  const session = await requireActiveSession();
  const status = statusSchema.parse(getStringValue(formData, "status"));

  await updateIncidentStatus({
    clerkOrgId: session.clerkOrgId,
    incidentId,
    status,
  });

  revalidatePath("/incidents");
}

export async function markIncidentReportedAction(
  incidentId: string,
  formData: FormData,
) {
  const session = await requireActiveSession();
  const regulator = regulatorSchema.parse(getStringValue(formData, "regulator"));

  await markIncidentReported({
    clerkOrgId: session.clerkOrgId,
    incidentId,
    regulator,
  });

  revalidatePath("/incidents");
}
