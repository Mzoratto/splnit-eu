import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  PENDING_AGENCY_SIGNUP_COOKIE,
  decodePendingAgencySignup,
} from "@/lib/agency/signup-cookie";
import {
  getAgencyByClerkOrgId,
  updateAgencySignupDetails,
} from "@/lib/db/queries/agencies";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();

  if (!session.userId || !session.orgId) {
    return NextResponse.json({ ready: false }, { status: 401 });
  }

  const agency = await getAgencyByClerkOrgId(session.orgId);

  if (!agency) {
    return NextResponse.json({ ready: false });
  }

  const cookieStore = await cookies();
  const pending = decodePendingAgencySignup(
    cookieStore.get(PENDING_AGENCY_SIGNUP_COOKIE)?.value,
  );

  if (pending?.clerkOrgId === session.orgId) {
    await updateAgencySignupDetails({
      clerkOrgId: session.orgId,
      name: pending.name,
      slug: pending.slug,
    });
  }

  cookieStore.delete(PENDING_AGENCY_SIGNUP_COOKIE);

  return NextResponse.json({ ready: true });
}
