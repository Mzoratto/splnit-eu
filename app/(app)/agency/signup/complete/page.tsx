import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { getLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { SetupPoller } from "@/app/(app)/agency/signup/complete/setup-poller";
import { getMessagesForLocale } from "@/i18n/messages";
import { normalizeLocale } from "@/i18n/routing";
import {
  PENDING_AGENCY_SIGNUP_COOKIE,
  decodePendingAgencySignup,
} from "@/lib/agency/signup-cookie";
import {
  getAgencyByClerkOrgId,
  updateAgencySignupDetails,
} from "@/lib/db/queries/agencies";

export const dynamic = "force-dynamic";

export default async function AgencySignupCompletePage() {
  const session = await auth();

  if (!session.userId) {
    redirect("/sign-in");
  }

  if (!session.orgId) {
    redirect("/dashboard");
  }

  const cookieStore = await cookies();
  const pending = decodePendingAgencySignup(
    cookieStore.get(PENDING_AGENCY_SIGNUP_COOKIE)?.value,
  );
  const agency = await getAgencyByClerkOrgId(session.orgId);

  if (agency) {
    if (pending?.clerkOrgId === session.orgId) {
      await updateAgencySignupDetails({
        clerkOrgId: session.orgId,
        name: pending.name,
        slug: pending.slug,
      });
    }

    cookieStore.delete(PENDING_AGENCY_SIGNUP_COOKIE);
    redirect("/agency/settings?setup=success");
  }

  const requestLocale = normalizeLocale(await getLocale()) ?? "cs-CZ";
  const copy = getMessagesForLocale(requestLocale).agency.signupComplete;

  return (
    <section className="space-y-4">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-primary">
          {copy.eyebrow}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal">
          {copy.title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground/64">
          {copy.body}
        </p>
      </div>
      <div className="h-2 max-w-xl overflow-hidden rounded-full bg-surface-muted">
        <div className="h-full w-1/2 animate-pulse rounded-full bg-primary" />
      </div>
      <SetupPoller
        readyPath="/agency/settings?setup=success"
        timeoutText={copy.timeout}
      />
    </section>
  );
}
