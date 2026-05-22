import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getLocale } from "next-intl/server";
import { BriefcaseBusiness, Copy, Palette, Users } from "lucide-react";
import {
  createAgencyClientInviteAction,
  recordAgencyConsultantInviteAction,
  updateAgencyBrandingAction,
} from "@/app/(app)/agency/actions";
import { getMessagesForLocale } from "@/i18n/messages";
import { normalizeLocale } from "@/i18n/routing";
import {
  getAgencySettings,
  requireAgencyConsultant,
} from "@/lib/db/queries/agencies";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type Tab = "branding" | "clients" | "consultants";

function getParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = searchParams[key];
  return Array.isArray(value) ? value[0] : value;
}

function normalizeTab(value: string | undefined): Tab {
  return value === "clients" || value === "consultants" ? value : "branding";
}

function formatDate(value: Date | string | null | undefined, emptyLabel: string) {
  if (!value) {
    return emptyLabel;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(new Date(value));
}

export default async function AgencySettingsPage({ searchParams }: PageProps) {
  const session = await auth();
  const membership = await requireAgencyConsultant(session.userId ?? "");
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const tab = normalizeTab(getParam(resolvedSearchParams, "tab"));
  const inviteToken = getParam(resolvedSearchParams, "inviteToken");
  const requestLocale = normalizeLocale(await getLocale()) ?? "cs-CZ";
  const copy = getMessagesForLocale(requestLocale).agency.settings;
  const settings = await getAgencySettings(membership.agency.id);
  const tabs: Array<{ icon: typeof Palette; id: Tab; label: string }> = [
    { icon: Palette, id: "branding", label: copy.tabs.branding },
    { icon: BriefcaseBusiness, id: "clients", label: copy.tabs.clients },
    { icon: Users, id: "consultants", label: copy.tabs.consultants },
  ];

  return (
    <section className="space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-primary">
          {copy.eyebrow}
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-normal">
          {copy.title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground/64">
          {copy.subtitle}
        </p>
      </div>

      <nav className="flex flex-wrap gap-2">
        {tabs.map((item) => (
          <Link
            key={item.id}
            href={`/agency/settings?tab=${item.id}`}
            className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm ${
              tab === item.id
                ? "border-primary bg-primary/8 text-primary"
                : "border-border bg-surface text-foreground/70 hover:bg-surface-muted"
            }`}
          >
            <item.icon className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
            {item.label}
          </Link>
        ))}
      </nav>

      {tab === "branding" ? (
        <form
          action={updateAgencyBrandingAction}
          encType="multipart/form-data"
          className="max-w-3xl space-y-4 rounded-lg border border-border bg-surface p-5"
        >
          <input
            type="hidden"
            name="existingLogoUrl"
            value={settings.branding?.logoUrl ?? ""}
          />
          <label className="grid gap-1.5 text-sm">
            {copy.branding.displayName}
            <input
              name="displayName"
              defaultValue={settings.branding?.displayName ?? membership.agency.name}
              className="rounded-md border border-border bg-background px-3 py-2"
            />
          </label>
          <label className="grid gap-1.5 text-sm">
            {copy.branding.logo}
            <input
              name="logo"
              type="file"
              accept="image/png,image/svg+xml"
              className="rounded-md border border-border bg-background px-3 py-2"
            />
            <span className="text-xs text-foreground/52">{copy.branding.logoHelp}</span>
          </label>
          <label className="grid gap-1.5 text-sm">
            {copy.branding.logoAltText}
            <input
              name="logoAltText"
              defaultValue={settings.branding?.logoAltText ?? ""}
              className="rounded-md border border-border bg-background px-3 py-2"
            />
          </label>
          <label className="grid gap-1.5 text-sm">
            {copy.branding.primaryColour}
            <input
              name="primaryColour"
              type="color"
              defaultValue={settings.branding?.primaryColour ?? "#0f766e"}
              className="h-10 rounded-md border border-border bg-background px-2 py-1"
            />
          </label>
          <label className="grid gap-1.5 text-sm">
            {copy.branding.poweredByText}
            <input
              name="poweredByText"
              defaultValue={settings.branding?.poweredByText ?? "Powered by Splnit.eu"}
              className="rounded-md border border-border bg-background px-3 py-2"
            />
          </label>
          <button type="submit" className="btn btn-primary">
            {copy.branding.save}
          </button>
        </form>
      ) : null}

      {tab === "clients" ? (
        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.4fr]">
          <section className="rounded-lg border border-border bg-surface p-5">
            <h2 className="font-medium">{copy.clients.inviteTitle}</h2>
            <form action={createAgencyClientInviteAction} className="mt-4 space-y-4">
              <label className="grid gap-1.5 text-sm">
                {copy.clients.email}
                <input
                  name="email"
                  type="email"
                  className="rounded-md border border-border bg-background px-3 py-2"
                />
              </label>
              <button type="submit" className="btn btn-primary">
                {copy.clients.createInvite}
              </button>
            </form>
            {inviteToken ? (
              <div className="mt-4 rounded-md border border-border bg-background p-3 text-sm">
                <p className="font-medium">{copy.clients.inviteReady}</p>
                <p className="mt-2 break-all font-mono text-xs text-foreground/64">
                  /agency-client-invites/{inviteToken}
                </p>
                <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-foreground/52">
                  <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                  {copy.clients.copyManually}
                </p>
              </div>
            ) : null}
          </section>
          <section className="rounded-lg border border-border bg-surface">
            <div className="border-b border-border p-4">
              <h2 className="font-medium">{copy.clients.connectedTitle}</h2>
            </div>
            <div className="divide-y divide-border">
              {settings.clients.length ? (
                settings.clients.map((client) => (
                  <Link
                    key={client.relationship.id}
                    href={`/agency/clients/${client.client.clerkOrgId}`}
                    className="block p-4 hover:bg-surface-muted"
                  >
                    <p className="font-medium">{client.client.name}</p>
                    <p className="mt-1 text-sm text-foreground/58">
                      {client.relationship.status} · {client.client.clerkOrgId}
                    </p>
                  </Link>
                ))
              ) : (
                <p className="p-4 text-sm text-foreground/58">{copy.clients.empty}</p>
              )}
            </div>
          </section>
        </div>
      ) : null}

      {tab === "consultants" ? (
        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.4fr]">
          <section className="rounded-lg border border-border bg-surface p-5">
            <h2 className="font-medium">{copy.consultants.inviteTitle}</h2>
            <form action={recordAgencyConsultantInviteAction} className="mt-4 space-y-4">
              <label className="grid gap-1.5 text-sm">
                {copy.consultants.email}
                <input
                  name="email"
                  type="email"
                  className="rounded-md border border-border bg-background px-3 py-2"
                />
              </label>
              <label className="grid gap-1.5 text-sm">
                {copy.consultants.clerkUserId}
                <input
                  name="clerkUserId"
                  placeholder="user_..."
                  className="rounded-md border border-border bg-background px-3 py-2"
                />
              </label>
              <label className="grid gap-1.5 text-sm">
                {copy.consultants.role}
                <select
                  name="role"
                  defaultValue="consultant"
                  className="rounded-md border border-border bg-background px-3 py-2"
                >
                  <option value="consultant">{copy.consultants.roles.consultant}</option>
                  <option value="admin">{copy.consultants.roles.admin}</option>
                </select>
              </label>
              <button type="submit" className="btn btn-primary">
                {copy.consultants.recordInvite}
              </button>
              <p className="text-xs leading-5 text-foreground/52">
                {copy.consultants.deliveryNote}
              </p>
            </form>
          </section>
          <section className="rounded-lg border border-border bg-surface">
            <div className="border-b border-border p-4">
              <h2 className="font-medium">{copy.consultants.membersTitle}</h2>
            </div>
            <div className="divide-y divide-border">
              {settings.consultants.length ? (
                settings.consultants.map((consultant) => (
                  <article key={consultant.id} className="p-4">
                    <p className="font-medium">
                      {consultant.email ?? consultant.clerkUserId ?? copy.consultants.unknown}
                    </p>
                    <p className="mt-1 text-sm text-foreground/58">
                      {consultant.role} · {consultant.status} ·{" "}
                      {formatDate(consultant.createdAt, copy.never)}
                    </p>
                  </article>
                ))
              ) : (
                <p className="p-4 text-sm text-foreground/58">{copy.consultants.empty}</p>
              )}
            </div>
          </section>
        </div>
      ) : null}
    </section>
  );
}
