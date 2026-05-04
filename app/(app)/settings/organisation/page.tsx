import { auth } from "@clerk/nextjs/server";
import { Building2, CheckCircle2, Database, ShieldCheck } from "lucide-react";
import { hasDatabaseUrl } from "@/lib/db";
import { getOrganisationByClerkOrgId } from "@/lib/db/queries/organisations";
import { normalizePlanKey } from "@/lib/stripe/plans";
import { updateOrganisationSettingsAction } from "./actions";

export const dynamic = "force-dynamic";

const sectorOptions = [
  { label: "Technology", value: "technology" },
  { label: "Finance", value: "finance" },
  { label: "Healthcare", value: "healthcare" },
  { label: "Manufacturing", value: "manufacturing" },
  { label: "Public sector", value: "public-sector" },
  { label: "Professional services", value: "professional-services" },
];

const employeeCountOptions = [
  { label: "1-9", value: "1-9" },
  { label: "10-49", value: "10-49" },
  { label: "50-249", value: "50-249" },
  { label: "250+", value: "250+" },
];

const countryOptions = [
  { label: "Czech Republic", value: "CZ" },
  { label: "Italy", value: "IT" },
  { label: "Germany", value: "DE" },
  { label: "France", value: "FR" },
  { label: "Spain", value: "ES" },
  { label: "Netherlands", value: "NL" },
  { label: "Poland", value: "PL" },
  { label: "Slovakia", value: "SK" },
  { label: "Austria", value: "AT" },
  { label: "Belgium", value: "BE" },
  { label: "Ireland", value: "IE" },
];

const jurisdictionOptions = [
  { label: "Czech Republic", value: "CZ" },
  { label: "Italy", value: "IT" },
  { label: "EU / English", value: "EU" },
];

const localeOptions = [
  { label: "Čeština (cs-CZ)", value: "cs-CZ" },
  { label: "English EU (en-EU)", value: "en-EU" },
  { label: "Italiano (it-IT)", value: "it-IT" },
];

type OrganisationSettingsData = {
  canMutate: boolean;
  clerkOrgId: string;
  country: string;
  employeeCount: string;
  ico: string;
  locale: string;
  name: string;
  onboardingCompletedAt: Date | string | null;
  plan: string;
  primaryJurisdiction: string;
  sector: string;
  toolInventory: string[];
  updatedAt: Date | string | null;
};

const fallbackOrganisation: OrganisationSettingsData = {
  canMutate: false,
  clerkOrgId: "demo",
  country: "CZ",
  employeeCount: "10-49",
  ico: "12345678",
  locale: "cs-CZ",
  name: "Demo organizace",
  onboardingCompletedAt: null,
  plan: "free",
  primaryJurisdiction: "CZ",
  sector: "technology",
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
    employeeCount: organisation?.employeeCount ?? "10-49",
    ico: organisation?.ico ?? "",
    locale: organisation?.locale ?? "cs-CZ",
    name: organisation?.name ?? "Organizace",
    onboardingCompletedAt: organisation?.onboardingCompletedAt ?? null,
    plan: normalizePlanKey(organisation?.plan),
    primaryJurisdiction: organisation?.primaryJurisdiction ?? "CZ",
    sector: organisation?.sector ?? "technology",
    toolInventory: organisation?.toolInventory ?? [],
    updatedAt: organisation?.updatedAt ?? null,
  };
}

function formatDate(value: Date | string | null | undefined) {
  if (!value) {
    return "not_set";
  }

  return new Intl.DateTimeFormat("cs-CZ", {
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

export default async function OrganisationSettingsPage() {
  const data = await loadOrganisationSettings();
  const nis2Category = getNis2Category(data);

  return (
    <section className="space-y-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-primary">
            Nastavení
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">
            Organizace
          </h1>
          <p className="mt-3 text-base leading-7 text-foreground/68">
            Základní identita organizace, kategorizace a vazba na Clerk workspace.
          </p>
        </div>
        <span
          className={`inline-flex w-fit rounded-md px-3 py-2 text-sm font-medium ${
            data.canMutate
              ? "bg-emerald-50 text-emerald-800"
              : "bg-surface-muted text-foreground/58"
          }`}
        >
          {data.canMutate ? "editable" : "demo_readonly"}
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <form
          action={updateOrganisationSettingsAction}
          className="rounded-lg border border-border bg-surface p-5"
        >
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-lg font-semibold">Profil organizace</h2>
          </div>

          <div className="mt-5 grid gap-4">
            <label className="grid gap-2 text-sm">
              Název firmy
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
                  className="rounded-md border border-border bg-background px-3 py-2"
                />
              </label>
              <label className="grid gap-2 text-sm">
                Počet zaměstnanců
                <select
                  name="employeeCount"
                  defaultValue={data.employeeCount}
                  disabled={!data.canMutate}
                  className="rounded-md border border-border bg-background px-3 py-2"
                >
                  {employeeCountOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="grid gap-2 text-sm">
              Sektor
              <select
                name="sector"
                defaultValue={data.sector}
                disabled={!data.canMutate}
                className="rounded-md border border-border bg-background px-3 py-2"
              >
                {sectorOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid gap-4 md:grid-cols-3">
              <label className="grid gap-2 text-sm">
                Země
                <select
                  name="country"
                  defaultValue={data.country}
                  disabled={!data.canMutate}
                  className="rounded-md border border-border bg-background px-3 py-2"
                >
                  {countryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm">
                Primární jurisdikce
                <select
                  name="primaryJurisdiction"
                  defaultValue={data.primaryJurisdiction}
                  disabled={!data.canMutate}
                  className="rounded-md border border-border bg-background px-3 py-2"
                >
                  {jurisdictionOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm">
                Locale
                <select
                  name="locale"
                  defaultValue={data.locale}
                  disabled={!data.canMutate}
                  className="rounded-md border border-border bg-background px-3 py-2"
                >
                  {localeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
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
            Uložit změny
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </form>

        <div className="grid gap-4">
          <article className="rounded-lg border border-border bg-surface p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
              <h2 className="text-lg font-semibold">NIS2 kategorizace</h2>
            </div>
            <p className="mt-4 font-mono text-xl font-semibold">
              {nis2Category}
            </p>
            <p className="mt-2 text-sm leading-6 text-foreground/62">
              Orientační interní štítek podle sektoru a velikosti. Finální právní
              posouzení zůstává mimo automatickou klasifikaci.
            </p>
          </article>

          <article className="rounded-lg border border-border bg-surface p-5">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" aria-hidden="true" />
              <h2 className="text-lg font-semibold">Workspace vazby</h2>
            </div>
            <dl className="mt-5 grid gap-3 text-sm">
              <div className="grid gap-1 sm:grid-cols-[150px_1fr]">
                <dt className="text-foreground/58">Clerk org</dt>
                <dd className="truncate font-mono text-xs">{data.clerkOrgId}</dd>
              </div>
              <div className="grid gap-1 sm:grid-cols-[150px_1fr]">
                <dt className="text-foreground/58">Plan</dt>
                <dd className="font-medium capitalize">{data.plan}</dd>
              </div>
              <div className="grid gap-1 sm:grid-cols-[150px_1fr]">
                <dt className="text-foreground/58">Jurisdiction</dt>
                <dd className="font-mono text-xs">
                  {data.country} / {data.primaryJurisdiction} / {data.locale}
                </dd>
              </div>
              <div className="grid gap-1 sm:grid-cols-[150px_1fr]">
                <dt className="text-foreground/58">Onboarding</dt>
                <dd>{formatDate(data.onboardingCompletedAt)}</dd>
              </div>
              <div className="grid gap-1 sm:grid-cols-[150px_1fr]">
                <dt className="text-foreground/58">Tool inventory</dt>
                <dd className="font-mono text-xs">{data.toolInventory.length}</dd>
              </div>
              <div className="grid gap-1 sm:grid-cols-[150px_1fr]">
                <dt className="text-foreground/58">Updated</dt>
                <dd>{formatDate(data.updatedAt)}</dd>
              </div>
            </dl>
          </article>
        </div>
      </div>
    </section>
  );
}
