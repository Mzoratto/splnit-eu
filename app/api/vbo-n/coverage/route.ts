import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { hasDatabaseUrl } from "@/lib/db";
import { getOrganisationByClerkOrgId } from "@/lib/db/queries/organisations";
import {
  getOrgStatusesByControlKey,
  getVboNRecordOverrides,
} from "@/lib/db/queries/vbo-n";
import {
  computeVboNCoverage,
  summarizeVboNCoverage,
} from "@/lib/regulations/vbo-n/coverage";

export async function GET() {
  if (!hasDatabaseUrl()) {
    return NextResponse.json({ error: "Service unavailable." }, { status: 503 });
  }

  const session = await auth();

  if (!session.userId || !session.orgId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const organisation = await getOrganisationByClerkOrgId(session.orgId);

  // Strict opt-in gate: only orgs in the lower-obligations regime see the
  // VBO-N surfaces; null/undefined regimes are treated as not opted in.
  if (organisation?.rezimPovinnosti !== "nizsi") {
    return NextResponse.json({ error: "Not available." }, { status: 404 });
  }

  const [statusesByControlKey, recordOverrides] = await Promise.all([
    getOrgStatusesByControlKey(session.orgId),
    getVboNRecordOverrides(session.orgId),
  ]);
  const items = computeVboNCoverage({ recordOverrides, statusesByControlKey });

  return NextResponse.json({
    items,
    summary: summarizeVboNCoverage(items),
  });
}
