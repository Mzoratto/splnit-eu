import { auth } from "@clerk/nextjs/server";
import { getLocale } from "next-intl/server";
import { Building2, CheckCircle2, Database, ShieldCheck } from "lucide-react";
import { getMessagesForLocale } from "@/i18n/messages";
import { normalizeLocale } from "@/i18n/routing";
import { hasDatabaseUrl } from "@/lib/db";
import { getOrganisationByClerkOrgId } from "@/lib/db/queries/organisations";
import { getJurisdictionContext } from "@/lib/jurisdictions/context";
import { normalizePlanKey } from "@/lib/stripe/plans";
import { updateOrganisationSettingsAction } from "./actions";

export const dynamic = "force-dynamic";

const sectorOptions = [
  "technology",
  "finance",
  "healthcare",
  "manufacturing",
  "public-sector",
  "professional-services",
] as const;
const employeeCountOptions = ["1-9", "10-49", "50-249", "250+"] as const;
const countryOptions = [
  "CZ",
  "IT",
  "DE",
  "FR",
  "ES",
  "NL",
  "PL",
  "SK",
  "AT",
  "BE",
  "IE",
] as const;
const jurisdictionOptions = ["CZ", "IT", "EU"] as const;
const localeOptions = ["cs-CZ", "en-EU", "it-IT"] as const;

type OrganisationSettingsData = {
  canMutate: boolean;
  clerkOrgId: string;
  country: string;
  dic: string;
  employeeCount: string;
  ico: string;
  locale: string;
  name: string;
  onboardingCompletedAt: Date | string | null;
  plan: string;
  primaryJurisdiction: string;
  sector: string;
  sidlo: string;
  toolInventory: string[];
  updatedAt: Date | string | null;
};

const fallbackOrganisation: OrganisationSettingsData = {
  canMutate: false,
  clerkOrgId: "demo",
  country: "CZ",
  dic: "CZ12345678",
  employeeCount: "10-49",
  ico: "12345678",
  locale: "cs-CZ",
  name: "Demo organizace",
  onboardingCompletedAt: null,
  plan: "free",
  primaryJurisdiction: "CZ",
  sector: "technology",
  sidlo: "Václavské náměstí 1, Praha",
  toolInventory: ["chatgpt", "microsoft-copilot"],
  updatedAt: null,
};

async function loadOrganisationSettings(): Promise<OrganisationSettingsData> {
  const clerkConfigured =
    Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
    Boolean(process.env.CLERK_SECRET_KEY);

  if (!clerkConfigured || !hasDatabaseUrl()) {
    return fallbackOrganisation;
  }

  const session = await auth();

  if (!session.orgId) {
    return fallbackOrganisation;
  }

  const organisation = await getOrganisationByClerkOrgId(session.orgId).catch(
    () => null,
  );

  return {
    canMutate: true,
    clerkOrgId: session.orgId,
    country: organisation?.country ?? "CZ",
    dic: organisation?.dic ?? "",
    employeeCount: organisation?.employeeCount ?? "10-49",
    ico: organisation?.ico ?? "",
    locale: organisation?.locale ?? "cs-CZ",
    name: organisation?.name ?? "Organizace",
    onboardingCompletedAt: organisation?.onboardingCompletedAt ?? null,
    plan: normalizePlanKey(organisation?.plan),
    primaryJurisdiction: organisation?.primaryJurisdiction ?? "CZ",
    sector: organisation?.sector ?? "technology",
    sidlo: organisation?.sidlo ?? "",
    toolInventory: organisation?.toolInventory ?? [],
    updatedAt: organisation?.updatedAt ?? null,
  };
}

function applyTestProfile(
  data: OrganisationSettingsData,
  testProfile: string | string[] | undefined,
): OrganisationSettingsData {
  const profile = Array.isArray(testProfile) ? testProfile[0] : testProfile;

  if (
    process.env.NEXT_PUBLIC_ENABLE_TEST_ROUTES !== "true" ||
    profile !== "editable-incomplete"
  ) {
    return data;
  }

  return {
    ...data,
    canMutate: true,
    dic: "",
  };
}

function formatDate(
  value: Date | string | null | undefined,
  locale: string,
  emptyLabel: string,
) {
  if (!value) {
    return emptyLabel;
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getNis2Category(input: { employeeCount: string; sector: string }) {
  const regulatedSectors = new Set([
    "finance",
    "healthcare",
    "manufacturing",
    "public-sector",
  ]);

  if (input.employeeCount === "250+" && regulatedSectors.has(input.sector)) {
    return "essential_or_important_entity_review";
  }

  if (input.employeeCount === "50-249" && regulatedSectors.has(input.sector)) {
    return "important_entity_review";
  }

  return "monitoring";
}

export default async function OrganisationSettingsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const data = applyTestProfile(
    await loadOrganisationSettings(),
    resolvedSearchParams.testProfile,
  );
  const nis2Category = getNis2Category(data);
  const requestLocale = normalizeLocale(await getLocale()) ?? "cs-CZ";
  const locale = data.canMutate
    ? normalizeLocale(data.locale) ?? requestLocale
    : requestLocale;
  const messages = getMessagesForLocale(locale);
  const copy = messages.organisationSettings;
  const onboardingCopy = messages.onboarding;
  const jurisdictionContext = getJurisdictionContext(
    data.primaryJurisdiction,
    locale,
  );

  return (
    <section className="space-y-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-primary">
            {copy.eyebrow}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">
            {copy.title}
          </h1>
          <p className="mt-3 text-base leading-7 text-foreground/68">
            {copy.description}
          </p>
        </div>
        <span
          className={`inline-flex w-fit rounded-md px-3 py-2 text-sm font-medium ${
            data.canMutate
              ? "bg-emerald-50 text-emerald-800"
              : "bg-surface-muted text-foreground/58"
          }`}
        >
          {data.canMutate ? copy.status.editable : copy.status.demoReadonly}
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <form
          action={updateOrganisationSettingsAction}
          className="rounded-lg border border-border bg-surface p-5"
        >
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-lg font-semibold">{copy.profile.title}</h2>
          </div>

          <div className="mt-5 grid gap-4">
            <label className="grid gap-2 text-sm">
              {copy.profile.companyName}
              <input
                name="name"
                defaultValue={data.name}
                disabled={!data.canMutate}
                className="rounded-md border border-border bg-background px-3 py-2"
              />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm">
                IČO
                <input
                  name="ico"
                  defaultValue={data.ico}
                  disabled={!data.canMutate}
                  inputMode="numeric"
                  maxLength={8}
                  pattern="[0-9]{8}"
                  required
                  title="IČO musí mít přesně 8 číslic."
                  className="rounded-md border border-border bg-background px-3 py-2"
                />
              </label>
              <label className="grid gap-2 text-sm">
                DIČ
                <input
                  name="dic"
                  defaultValue={data.dic}
                  disabled={!data.canMutate}
                  maxLength={12}
                  pattern="CZ[0-9]{8,10}"
                  required
                  title="DIČ musí být ve formátu CZ12345678."
                  className="rounded-md border border-border bg-background px-3 py-2"
                />
              </label>
            </div>

            <label className="grid gap-2 text-sm">
              Sídlo
              <textarea
                name="sidlo"
                defaultValue={data.sidlo}
                disabled={!data.canMutate}
                maxLength={200}
                required
                rows={3}
                className="resize-none rounded-md border border-border bg-background px-3 py-2"
              />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm">
                {copy.profile.employeeCount}
                <select
                  name="employeeCount"
                  defaultValue={data.employeeCount}
                  disabled={!data.canMutate}
                  className="rounded-md border border-border bg-background px-3 py-2"
                >
                  {employeeCountOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="grid gap-2 text-sm">
              {copy.profile.sector}
              <select
                name="sector"
                defaultValue={data.sector}
                disabled={!data.canMutate}
                className="rounded-md border border-border bg-background px-3 py-2"
              >
                {sectorOptions.map((option) => (
                  <option key={option} value={option}>
                    {onboardingCopy.sectors[option]}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid gap-4 md:grid-cols-3">
              <label className="grid gap-2 text-sm">
                {copy.profile.country}
                <select
                  name="country"
                  defaultValue={data.country}
                  disabled={!data.canMutate}
                  className="rounded-md border border-border bg-background px-3 py-2"
                >
                  {countryOptions.map((option) => (
                    <option key={option} value={option}>
                      {onboardingCopy.countries[option]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm">
                {copy.profile.primaryJurisdiction}
                <select
                  name="primaryJurisdiction"
                  defaultValue={data.primaryJurisdiction}
                  disabled={!data.canMutate}
                  className="rounded-md border border-border bg-background px-3 py-2"
                >
                  {jurisdictionOptions.map((option) => (
                    <option key={option} value={option}>
                      {onboardingCopy.jurisdictions[option]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm">
                {copy.profile.locale}
                <select
                  name="locale"
                  defaultValue={data.locale}
                  disabled={!data.canMutate}
                  className="rounded-md border border-border bg-background px-3 py-2"
                >
                  {localeOptions.map((option) => (
                    <option key={option} value={option}>
                      {onboardingCopy.locales[option]}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={!data.canMutate}
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            {copy.profile.save}
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </form>

        <div className="grid gap-4">
          <article className="rounded-lg border border-border bg-surface p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
              <h2 className="text-lg font-semibold">{copy.nis2.title}</h2>
            </div>
            <p className="mt-4 text-xl font-semibold">
              {copy.nis2.categories[nis2Category]}
            </p>
            <p className="mt-1 font-mono text-xs text-foreground/48">
              {nis2Category}
            </p>
            <p className="mt-3 text-sm leading-6 text-foreground/62">
              {copy.nis2.description}
            </p>
          </article>

          <article className="rounded-lg border border-border bg-surface p-5">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" aria-hidden="true" />
              <h2 className="text-lg font-semibold">{copy.workspace.title}</h2>
            </div>
            <dl className="mt-5 grid gap-3 text-sm">
              <div className="grid gap-1 sm:grid-cols-[150px_1fr]">
                <dt className="text-foreground/58">{copy.workspace.clerkOrg}</dt>
                <dd className="truncate font-mono text-xs">{data.clerkOrgId}</dd>
              </div>
              <div className="grid gap-1 sm:grid-cols-[150px_1fr]">
                <dt className="text-foreground/58">{copy.workspace.plan}</dt>
                <dd className="font-medium capitalize">{data.plan}</dd>
              </div>
              <div className="grid gap-1 sm:grid-cols-[150px_1fr]">
                <dt className="text-foreground/58">
                  {copy.workspace.jurisdiction}
                </dt>
                <dd className="font-mono text-xs">
                  {data.country} / {data.primaryJurisdiction} / {data.locale}
                </dd>
              </div>
              <div className="grid gap-1 sm:grid-cols-[150px_1fr]">
                <dt className="text-foreground/58">{copy.workspace.onboarding}</dt>
                <dd>
                  {formatDate(
                    data.onboardingCompletedAt,
                    jurisdictionContext.dateLocale,
                    copy.workspace.notSet,
                  )}
                </dd>
              </div>
              <div className="grid gap-1 sm:grid-cols-[150px_1fr]">
                <dt className="text-foreground/58">
                  {copy.workspace.toolInventory}
                </dt>
                <dd className="font-mono text-xs">{data.toolInventory.length}</dd>
              </div>
              <div className="grid gap-1 sm:grid-cols-[150px_1fr]">
                <dt className="text-foreground/58">{copy.workspace.updated}</dt>
                <dd>
                  {formatDate(
                    data.updatedAt,
                    jurisdictionContext.dateLocale,
                    copy.workspace.notSet,
                  )}
                </dd>
              </div>
            </dl>
          </article>
        </div>
      </div>
    </section>
  );
}
