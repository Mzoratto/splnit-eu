"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import {
  confirmDiscoveredAsset,
  confirmDiscoveredVendor,
  dismissDiscoveredItem,
} from "@/lib/discovery/confirm";
import { discoverForOrg } from "@/lib/discovery/runner";

function requireSession() {
  return auth().then((session) => {
    if (!session.orgId || !session.userId) {
      throw new Error("Unauthorized.");
    }

    return {
      orgId: session.orgId,
      userId: session.userId,
    };
  });
}

export async function runDiscoveryAction() {
  const { orgId } = await requireSession();
  await discoverForOrg(orgId);
  revalidatePath("/discovery");
}

export async function confirmDiscoveredAssetAction(id: string) {
  const { orgId, userId } = await requireSession();
  await confirmDiscoveredAsset({
    clerkOrgId: orgId,
    discoveredAssetId: id,
    userId,
  });
  revalidatePath("/discovery");
  revalidatePath("/controls");
}

export async function confirmDiscoveredVendorAction(id: string) {
  const { orgId } = await requireSession();
  await confirmDiscoveredVendor({
    clerkOrgId: orgId,
    discoveredVendorId: id,
  });
  revalidatePath("/discovery");
  revalidatePath("/vendors");
}

export async function dismissDiscoveredItemAction(
  kind: "asset" | "vendor",
  id: string,
) {
  const { orgId } = await requireSession();
  await dismissDiscoveredItem({
    clerkOrgId: orgId,
    id,
    kind,
  });
  revalidatePath("/discovery");
}
