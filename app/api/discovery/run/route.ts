import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { discoverForOrg } from "@/lib/discovery/runner";
import { discoveryCapableProviders } from "@/lib/discovery/registry";

const requestSchema = z.object({
  provider: z.enum(discoveryCapableProviders).optional(),
}).optional();

export async function POST(request: Request) {
  const session = await auth();

  if (!session.orgId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: unknown = undefined;
  const rawBody = await request.text();
  if (rawBody.trim()) {
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { error: "Invalid discovery request." },
        { status: 400 },
      );
    }
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid discovery request." },
      { status: 400 },
    );
  }

  try {
    const summaries = await discoverForOrg(session.orgId, {
      provider: parsed.data?.provider,
    });
    const publicSummaries = summaries.map((summary) => ({
      assetsProposed: summary.assetsProposed,
      newAssets: summary.newAssets,
      newVendors: summary.newVendors,
      provider: summary.provider,
      skipped: summary.skipped,
      vendorsProposed: summary.vendorsProposed,
      warnings: summary.warnings,
    }));
    const totals = publicSummaries.reduce(
      (acc, summary) => ({
        assets: acc.assets + summary.assetsProposed,
        newAssets: acc.newAssets + summary.newAssets,
        newVendors: acc.newVendors + summary.newVendors,
        vendors: acc.vendors + summary.vendorsProposed,
      }),
      { assets: 0, newAssets: 0, newVendors: 0, vendors: 0 },
    );

    return NextResponse.json({ summaries: publicSummaries, totals });
  } catch {
    return NextResponse.json(
      { error: "Discovery scan failed." },
      { status: 500 },
    );
  }
}
