"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { markRegulationUpdateRead } from "@/lib/db/queries/regulation-updates";

const updateIdSchema = z.string().uuid();

export async function markRegulationUpdateReadAction(updateId: string) {
  const session = await auth();

  if (!session.userId || !session.orgId) {
    redirect("/sign-in");
  }

  await markRegulationUpdateRead({
    clerkOrgId: session.orgId,
    updateId: updateIdSchema.parse(updateId),
  });

  revalidatePath("/dashboard");
}
