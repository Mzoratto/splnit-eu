import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { riskItems } from "@/lib/db/schema";
import type { CommonRisk } from "@/lib/risks/common";

export async function listRiskItemsForOrg(clerkOrgId: string) {
  const db = getDb();

  return db
    .select()
    .from(riskItems)
    .where(eq(riskItems.clerkOrgId, clerkOrgId))
    .orderBy(desc(riskItems.riskScore), desc(riskItems.createdAt))
    .limit(200);
}

export async function createRiskItem(input: {
  category: string | null;
  clerkOrgId: string;
  description: string | null;
  dueDate: string | null;
  impact: number;
  likelihood: number;
  owner: string | null;
  title: string;
}) {
  const db = getDb();
  const riskScore = input.likelihood * input.impact;

  await db.insert(riskItems).values({
    category: input.category,
    clerkOrgId: input.clerkOrgId,
    description: input.description,
    dueDate: input.dueDate,
    impact: input.impact,
    likelihood: input.likelihood,
    owner: input.owner,
    riskScore,
    status: "open",
    title: input.title,
  });
}

export async function updateRiskItemStatus(input: {
  clerkOrgId: string;
  riskId: string;
  status: string;
}) {
  const db = getDb();

  await db
    .update(riskItems)
    .set({
      status: input.status,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(riskItems.clerkOrgId, input.clerkOrgId),
        eq(riskItems.id, input.riskId),
      ),
    );
}

export async function seedCommonRiskItems(input: {
  clerkOrgId: string;
  risks: CommonRisk[];
}) {
  const db = getDb();
  const existingRows = await db
    .select({ id: riskItems.id })
    .from(riskItems)
    .where(eq(riskItems.clerkOrgId, input.clerkOrgId))
    .limit(1);

  if (existingRows.length > 0) {
    return 0;
  }

  await db.insert(riskItems).values(
    input.risks.map((risk) => ({
      category: risk.category,
      clerkOrgId: input.clerkOrgId,
      description: risk.description,
      impact: risk.impact,
      likelihood: risk.likelihood,
      owner: risk.owner,
      riskScore: risk.likelihood * risk.impact,
      status: "open",
      title: risk.title,
    })),
  );

  return input.risks.length;
}
