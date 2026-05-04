import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getLocale } from "next-intl/server";
import { ArrowLeft, Brush, CheckCircle2, ShieldCheck } from "lucide-react";
import { getMessagesForLocale } from "@/i18n/messages";
import { normalizeLocale, type Locale } from "@/i18n/routing";
import { hasDatabaseUrl } from "@/lib/db";
import { getConsultantClientDetail } from "@/lib/db/queries/consultant-clients";
import { getOrganisationByClerkOrgId } from "@/lib/db/queries/organisations";
import { CONTROL_LIBRARY } from "@/lib/controls/library";
import { FRAMEWORK_LIBRARY } from "@/lib/frameworks/registry";
import { hasPlanAccess, normalizePlanKey } from "@/lib/stripe/plans";
import { updateClientBrandingAction } from "../actions";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ clientOrgId: string }>;
};

type ClientDetailCopy = ReturnType<typeof getMessagesForLocale>["clientDetailPage"];

function demoClient(clientOrgId: string, locale: Locale, copy: ClientDetailCopy) {
  if (!clientOrgId.startsWith("demo-")) {
    return null;
  }

  return {
    dashboard: {
      priorityControls: CONTROL_LIBRARY.slice(0, 4).map((control, index) => ({
        category: control.category,
        key: control.key,
        status: index === 0 ? "fail" : "manual_review",
        title: locale === "cs-CZ" ? control.titleCs : control.titleEn,
      })),
    },
    frameworks: FRAMEWORK_LIBRARY.slice(0, 4).map((framework, index) => ({
      name: locale === "cs-CZ" ? framework.nameCs : framework.nameEn,
      regulator: framework.regulator,
      score: [84, 71, 77, 65][index] ?? 0,
      slug: framework.slug,
      status: "active",
    })),
    relationship: {
      accessLevel: "manage",
      client: {
        clerkOrgId: clientOrgId,
        name:
          clientOrgId === "demo-client-b"
            ? copy.demo.clientB
            : copy.demo.clientA,
        plan: clientOrgId === "demo-client-b" ? "starter" : "business",
        sector: clientOrgId === "demo-client-b" ? "Finance" : copy.demo.manufacturing,
      },
      inviteEmail:
        clientOrgId === "demo-client-b"
          ? "compliance@example.test"
          : "security@example.test",
      status: "active",
      whiteLabelAccentColor: "#1b7f5a",
      whiteLabelLogoUrl: null,
    },
  };
}

async function loadClient(
  clientOrgId: string,
  requestLocale: Locale,
  copy: ClientDetailCopy,
) {
  const clerkConfigured =
    Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
    Boolean(process.env.CLERK_SECRET_KEY);

  if (!clerkConfigured || !hasDatabaseUrl()) {
    return {
      canMutate: false,
      data: demoClient(clientOrgId, requestLocale, copy),
      organisationLocale: null,
    };
  }

  const session = await auth();
  if (!session.orgId) {
    return {
      canMutate: false,
      data: null,
      organisationLocale: null,
    };
  }

  const organisation = await getOrganisationByClerkOrgId(session.orgId);
  const plan = normalizePlanKey(organisation?.plan);

  if (!hasPlanAccess(plan, "consultant")) {
    return {
      canMutate: false,
      data: null,
      organisationLocale: organisation?.locale ?? null,
    };
  }

  return {
    canMutate: true,
    data: await getConsultantClientDetail({
      clientOrgId,
      consultantOrgId: session.orgId,
    }),
    organisationLocale: organisation?.locale ?? null,
  };
}

function averageScore(frameworks: { score: number | null }[]) {
  const scores = frameworks
    .map((framework) => framework.score)
    .filter((score): score is number => typeof score === "number");

  if (!scores.length) {
    return 0;
  }

  return Math.round(scores.reduce((total, score) => total + score, 0) / scores.length);
}

function getCategoryLabel(category: string | null | undefined, copy: ClientDetailCopy) {
  if (!category) {
    return copy.emptyValue;
  }

  return copy.categories[category as keyof typeof copy.categories] ?? category;
}

function statusLabel(status: string, copy: ClientDetailCopy) {
  return copy.statuses[status as keyof typeof copy.statuses] ?? status;
}

export default async function ConsultantClientPage({ params }: PageProps) {
  const { clientOrgId } = await params;
  const requestLocale = normalizeLocale(await getLocale()) ?? "cs-CZ";
  const requestCopy = getMessagesForLocale(requestLocale).clientDetailPage;
  const loaded = await loadClient(clientOrgId, requestLocale, requestCopy);
  const locale = normalizeLocale(loaded.organisationLocale) ?? requestLocale;
  const copy = getMessagesForLocale(locale).clientDetailPage;
  const data =
    locale === requestLocale
      ? loaded.data
      : loaded.data ?? demoClient(clientOrgId, locale, copy);

  if (!data) {
    notFound();
  }

  const canMutate = loaded.canMutate;
  const client = data.relationship.client;
  const score = averageScore(data.frameworks);
  const priorityControls = data.dashboard.priorityControls.length
    ? data.dashboard.priorityControls
    : CONTROL_LIBRARY.slice(0, 4).map((control) => ({
        category: control.category,
        key: control.key,
        status: "unknown",
        title: locale === "cs-CZ" ? control.titleCs : control.titleEn,
      }));

  return (
    <section className="space-y-8">
      <div>
        <Link
          href="/clients"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {copy.back}
        </Link>
        <div className="mt-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.14em] text-primary">
              {copy.eyebrow}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal">
              {client.name}
            </h1>
            <p className="mt-2 text-sm leading-6 text-foreground/64">
              {client.sector ?? copy.sectorEmpty} · {client.plan} ·{" "}
              {copy.access} {data.relationship.accessLevel}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-surface px-5 py-4">
            <p className="text-sm text-foreground/58">{copy.averageScore}</p>
            <p className="mt-1 font-mono text-4xl font-semibold text-primary">
              {score}%
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-lg border border-border bg-surface p-5">
          <p className="text-sm text-foreground/58">{copy.frameworksMetric}</p>
          <p className="mt-2 font-mono text-3xl font-semibold text-primary">
            {data.frameworks.length}
          </p>
        </article>
        <article className="rounded-lg border border-border bg-surface p-5">
          <p className="text-sm text-foreground/58">{copy.priorityControlsMetric}</p>
          <p className="mt-2 font-mono text-3xl font-semibold text-primary">
            {priorityControls.length}
          </p>
        </article>
        <article className="rounded-lg border border-border bg-surface p-5">
          <p className="text-sm text-foreground/58">{copy.trustCenterColour}</p>
          <div
            className="mt-3 h-8 rounded-md border border-border"
            style={{
              backgroundColor:
                data.relationship.whiteLabelAccentColor ?? "#1b7f5a",
            }}
          />
        </article>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_0.8fr]">
        <section className="rounded-lg border border-border bg-surface">
          <div className="flex items-center gap-2 border-b border-border p-5">
            <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-lg font-semibold">{copy.frameworkScores}</h2>
          </div>
          <div className="grid gap-4 p-5 md:grid-cols-2">
            {data.frameworks.map((framework) => (
              <article key={framework.slug} className="rounded-md bg-surface-muted p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold">{framework.name}</h3>
                    <p className="mt-1 text-sm text-foreground/58">
                      {framework.regulator ?? copy.regulatorEmpty}
                    </p>
                  </div>
                  <span className="rounded-md bg-background px-2 py-1 text-xs">
                    {statusLabel(framework.status, copy)}
                  </span>
                </div>
                <p className="mt-5 font-mono text-3xl font-semibold text-primary">
                  {framework.score ?? 0}%
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-border bg-surface">
          <div className="flex items-center gap-2 border-b border-border p-5">
            <Brush className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-lg font-semibold">White-label</h2>
          </div>
          <form
            action={updateClientBrandingAction.bind(null, client.clerkOrgId)}
            className="space-y-4 p-5"
          >
            <label className="grid gap-2 text-sm">
              {copy.logoUrl}
              <input
                name="logoUrl"
                type="url"
                defaultValue={data.relationship.whiteLabelLogoUrl ?? ""}
                disabled={!canMutate}
                className="rounded-md border border-border bg-background px-3 py-2"
              />
            </label>
            <label className="grid gap-2 text-sm">
              {copy.accentColour}
              <input
                name="accentColor"
                type="color"
                defaultValue={
                  data.relationship.whiteLabelAccentColor ?? "#1b7f5a"
                }
                disabled={!canMutate}
                className="h-10 rounded-md border border-border bg-background px-2 py-1"
              />
            </label>
            <button
              type="submit"
              disabled={!canMutate}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              {copy.saveBranding}
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            </button>
          </form>
        </section>
      </div>

      <section className="rounded-lg border border-border bg-surface">
        <div className="border-b border-border p-5">
          <h2 className="text-lg font-semibold">{copy.priorityControlsTitle}</h2>
        </div>
        <div className="divide-y divide-border">
          {priorityControls.map((control) => (
            <article key={control.key} className="grid gap-3 p-5 md:grid-cols-[1fr_auto]">
              <div>
                <p className="font-medium">{control.title}</p>
                <p className="mt-1 text-sm text-foreground/58">
                  {getCategoryLabel(control.category, copy)}
                </p>
              </div>
              <span className="rounded-md bg-surface-muted px-2 py-1 text-sm">
                {statusLabel(control.status, copy)}
              </span>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
