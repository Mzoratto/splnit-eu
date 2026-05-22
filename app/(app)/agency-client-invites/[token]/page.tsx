import { getLocale } from "next-intl/server";
import { CheckCircle2 } from "lucide-react";
import { consumeAgencyClientInviteAction } from "@/app/(app)/agency/actions";
import { getMessagesForLocale } from "@/i18n/messages";
import { normalizeLocale } from "@/i18n/routing";
import {
  getAgencyClientInviteByToken,
  getAgencyConsultantInviteByToken,
} from "@/lib/db/queries/agencies";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ token: string }>;
};

export default async function AgencyClientInvitePage({ params }: PageProps) {
  const { token } = await params;
  const requestLocale = normalizeLocale(await getLocale()) ?? "cs-CZ";
  const copy = getMessagesForLocale(requestLocale).agency.invites;
  const [clientInvite, consultantInvite] = await Promise.all([
    getAgencyClientInviteByToken(token),
    getAgencyConsultantInviteByToken(token),
  ]);
  const invite = clientInvite ?? consultantInvite;
  const isConsultantInvite = Boolean(consultantInvite);
  const isExpired = invite
    ? invite.invite.expiresAt.getTime() <= Date.now()
    : false;
  const canAccept = Boolean(invite && invite.invite.status === "pending" && !isExpired);

  return (
    <section className="mx-auto max-w-xl space-y-5">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-primary">
          {copy.eyebrow}
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-normal">
          {copy.title}
        </h1>
        <p className="mt-2 text-sm leading-6 text-foreground/64">
          {invite
            ? (isConsultantInvite ? copy.consultantBody : copy.body).replace(
                "{agency}",
                invite.agency.name,
              )
            : copy.invalidBody}
        </p>
      </div>

      <div className="rounded-lg border border-border bg-surface p-5">
        {canAccept ? (
          <form action={consumeAgencyClientInviteAction.bind(null, token)} className="space-y-4">
            <p className="text-sm leading-6 text-foreground/64">
              {isConsultantInvite ? copy.consultantHelp : copy.activeHelp}
            </p>
            <button type="submit" className="btn btn-primary">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
              {copy.accept}
            </button>
          </form>
        ) : (
          <p className="text-sm leading-6 text-foreground/64">
            {isExpired ? copy.expired : copy.unavailable}
          </p>
        )}
      </div>
    </section>
  );
}
