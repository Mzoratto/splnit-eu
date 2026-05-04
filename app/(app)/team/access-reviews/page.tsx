import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getLocale } from "next-intl/server";
import {
  CheckCircle2,
  Download,
  GitBranch,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { getMessagesForLocale } from "@/i18n/messages";
import { normalizeLocale, type Locale } from "@/i18n/routing";
import { hasDatabaseUrl } from "@/lib/db";
import {
  getAccessReviewDetail,
  listAccessReviewsForOrg,
} from "@/lib/db/queries/access-reviews";
import { getOrganisationByClerkOrgId } from "@/lib/db/queries/organisations";
import {
  completeAccessReviewAction,
  startAccessReviewAction,
  updateAccessReviewDecisionAction,
} from "./actions";

export const dynamic = "force-dynamic";

type Review = Awaited<ReturnType<typeof listAccessReviewsForOrg>>[number];
type ReviewDetail = NonNullable<
  Awaited<ReturnType<typeof getAccessReviewDetail>>
>;
type ReviewItem = ReviewDetail["items"][number];
type AccessReviewsCopy = ReturnType<typeof getMessagesForLocale>["accessReviews"];

async function loadAccessReviews(
  selectedReviewId: string | undefined,
  requestLocale: Locale,
) {
  const clerkConfigured =
    Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
    Boolean(process.env.CLERK_SECRET_KEY);

  if (!clerkConfigured || !hasDatabaseUrl()) {
    return getDemoData(getMessagesForLocale(requestLocale).accessReviews);
  }

  const session = await auth();

  if (!session.orgId) {
    return getDemoData(getMessagesForLocale(requestLocale).accessReviews);
  }

  const [organisation, reviews] = await Promise.all([
    getOrganisationByClerkOrgId(session.orgId).catch(() => null),
    listAccessReviewsForOrg(session.orgId).catch(() => []),
  ]);
  const activeReviewId = selectedReviewId ?? reviews[0]?.id ?? null;
  const detail = activeReviewId
    ? await getAccessReviewDetail({
        clerkOrgId: session.orgId,
        reviewId: activeReviewId,
      }).catch(() => null)
    : null;

  return {
    canMutate: true,
    detail,
    organisationLocale: organisation?.locale ?? null,
    reviews,
  };
}

function getDemoData(copy: AccessReviewsCopy): {
  canMutate: boolean;
  detail: ReviewDetail;
  organisationLocale: string | null;
  reviews: Review[];
} {
  const createdAt = new Date();
  const dueDate = new Date(Date.now() + 21 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const review = {
    clerkOrgId: "demo",
    completedAt: null,
    createdAt,
    dueDate,
    id: "demo-access-review",
    name: copy.demo.reviewName,
    provider: "all",
    reviewedItems: 2,
    status: "in_progress",
    totalItems: 4,
  } satisfies Review;
  const items = [
    {
      accessLevel: copy.demo.items.memberEnabled,
      clerkOrgId: "demo",
      decidedAt: new Date(),
      decidedBy: "demo-admin",
      decision: "keep",
      id: "demo-1",
      resource: "Microsoft Entra ID",
      reviewId: review.id,
      userEmail: "anna@example.com",
      userName: "Anna Novak",
    },
    {
      accessLevel: copy.demo.items.guestEnabled,
      clerkOrgId: "demo",
      decidedAt: null,
      decidedBy: null,
      decision: null,
      id: "demo-2",
      resource: "Microsoft Entra ID",
      reviewId: review.id,
      userEmail: "vendor@example.com",
      userName: copy.demo.items.vendorUser,
    },
    {
      accessLevel: copy.demo.items.userAccess,
      clerkOrgId: "demo",
      decidedAt: new Date(),
      decidedBy: "demo-admin",
      decision: "modify",
      id: "demo-3",
      resource: "GitHub: demo-org",
      reviewId: review.id,
      userEmail: null,
      userName: "platform-owner",
    },
    {
      accessLevel: copy.demo.items.userAccess,
      clerkOrgId: "demo",
      decidedAt: null,
      decidedBy: null,
      decision: null,
      id: "demo-4",
      resource: "GitHub: demo-org",
      reviewId: review.id,
      userEmail: null,
      userName: "former-contractor",
    },
  ] satisfies ReviewItem[];

  return {
    canMutate: false,
    detail: {
      items,
      review,
    },
    organisationLocale: null,
    reviews: [review],
  };
}

function formatDate(
  value: Date | string | null | undefined,
  locale: Locale,
  emptyLabel: string,
) {
  if (!value) {
    return emptyLabel;
  }

  return new Intl.DateTimeFormat(locale).format(new Date(value));
}

function decisionClass(decision: string | null, candidate: string) {
  if (decision === candidate) {
    if (candidate === "keep") {
      return "bg-emerald-50 text-emerald-800";
    }

    if (candidate === "modify") {
      return "bg-amber-50 text-amber-900";
    }

    return "bg-red-50 text-red-800";
  }

  return "border border-border text-foreground/64 hover:bg-surface-muted";
}

function statusClass(status: string) {
  if (status === "completed") {
    return "bg-emerald-50 text-emerald-800";
  }

  if (status === "ready") {
    return "bg-blue-50 text-blue-800";
  }

  return "bg-surface-muted text-foreground/64";
}

function getProgress(review: Review) {
  if (!review.totalItems) {
    return 0;
  }

  return Math.round(((review.reviewedItems ?? 0) / review.totalItems) * 100);
}

function interpolate(template: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, String(value)),
    template,
  );
}

function statusLabel(status: string, copy: AccessReviewsCopy) {
  return copy.statuses[status as keyof typeof copy.statuses] ?? status;
}

function providerLabel(provider: string | null | undefined, copy: AccessReviewsCopy) {
  if (!provider) {
    return copy.providers.none;
  }

  return copy.providers[provider as keyof typeof copy.providers] ?? provider;
}

function decisionLabel(decision: string | null, copy: AccessReviewsCopy) {
  if (!decision) {
    return copy.decisions.pending;
  }

  return copy.decisions[decision as keyof typeof copy.decisions] ?? decision;
}

export default async function AccessReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ reviewId?: string }>;
}) {
  const { reviewId } = await searchParams;
  const requestLocale = normalizeLocale(await getLocale()) ?? "cs-CZ";
  const {
    canMutate,
    detail,
    organisationLocale,
    reviews,
  } = await loadAccessReviews(reviewId, requestLocale);
  const locale = normalizeLocale(organisationLocale) ?? requestLocale;
  const copy = getMessagesForLocale(locale).accessReviews;
  const activeReview = detail?.review ?? null;
  const activeItems = detail?.items ?? [];
  const progress = activeReview ? getProgress(activeReview) : 0;
  const defaultDueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  return (
    <section className="space-y-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-primary">
            {copy.eyebrow}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">
            {copy.title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground/64">
            {copy.subtitle}
          </p>
        </div>
        {activeReview ? (
          <a
            href={`/api/access-reviews/${activeReview.id}/export`}
            className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-3 text-sm font-medium hover:bg-surface-muted"
          >
            {copy.exportCsv}
            <Download className="h-4 w-4" aria-hidden="true" />
          </a>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-lg border border-border bg-surface p-5">
          <div className="flex items-center gap-2">
            <UsersRound className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-lg font-semibold">{copy.metrics.activeTitle}</h2>
          </div>
          <p className="mt-4 font-mono text-2xl font-semibold">
            {reviews.filter((review) => review.status !== "completed").length}
          </p>
          <p className="mt-2 text-sm text-foreground/58">
            {interpolate(copy.metrics.activeBody, { count: reviews.length })}
          </p>
        </article>
        <article className="rounded-lg border border-border bg-surface p-5">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-lg font-semibold">{copy.metrics.progressTitle}</h2>
          </div>
          <p className="mt-4 font-mono text-2xl font-semibold">{progress}%</p>
          <p className="mt-2 text-sm text-foreground/58">
            {interpolate(copy.metrics.progressBody, {
              reviewed: activeReview?.reviewedItems ?? 0,
              total: activeReview?.totalItems ?? 0,
            })}
          </p>
        </article>
        <article className="rounded-lg border border-border bg-surface p-5">
          <div className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-lg font-semibold">{copy.metrics.providerTitle}</h2>
          </div>
          <p className="mt-4 font-mono text-2xl font-semibold">
            {providerLabel(activeReview?.provider, copy)}
          </p>
          <p className="mt-2 text-sm text-foreground/58">
            {copy.metrics.due}{" "}
            {formatDate(activeReview?.dueDate, locale, copy.noDate)}
          </p>
        </article>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.78fr_1.4fr]">
        <section className="space-y-4">
          <article className="rounded-lg border border-border bg-surface p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
              <h2 className="text-lg font-semibold">{copy.form.title}</h2>
            </div>
            <form action={startAccessReviewAction} className="mt-5 space-y-4">
              <label className="grid gap-2 text-sm">
                {copy.form.name}
                <input
                  name="name"
                  placeholder={copy.form.namePlaceholder}
                  disabled={!canMutate}
                  className="rounded-md border border-border bg-background px-3 py-2"
                />
              </label>
              <label className="grid gap-2 text-sm">
                {copy.form.provider}
                <select
                  name="provider"
                  defaultValue="all"
                  disabled={!canMutate}
                  className="rounded-md border border-border bg-background px-3 py-2"
                >
                  <option value="all">{copy.providers.all}</option>
                  <option value="microsoft365">{copy.providers.microsoft365}</option>
                  <option value="github">{copy.providers.github}</option>
                </select>
              </label>
              <label className="grid gap-2 text-sm">
                {copy.form.dueDate}
                <input
                  name="dueDate"
                  type="date"
                  defaultValue={defaultDueDate}
                  disabled={!canMutate}
                  className="rounded-md border border-border bg-background px-3 py-2"
                />
              </label>
              <button
                type="submit"
                disabled={!canMutate}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
              >
                {copy.form.start}
                <UsersRound className="h-4 w-4" aria-hidden="true" />
              </button>
            </form>
          </article>

          <article className="rounded-lg border border-border bg-surface">
            <div className="border-b border-border p-5">
              <h2 className="text-lg font-semibold">{copy.history.title}</h2>
            </div>
            <div className="divide-y divide-border">
              {reviews.length ? (
                reviews.map((review) => (
                  <Link
                    key={review.id}
                    href={`/team/access-reviews?reviewId=${review.id}`}
                    className="block p-5 hover:bg-surface-muted"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{review.name}</p>
                      <span
                        className={`rounded-md px-2 py-1 text-xs font-medium ${statusClass(
                          review.status,
                        )}`}
                      >
                        {statusLabel(review.status, copy)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-foreground/58">
                      {providerLabel(review.provider, copy)} ·{" "}
                      {review.reviewedItems ?? 0}/{review.totalItems ?? 0}
                    </p>
                  </Link>
                ))
              ) : (
                <p className="p-5 text-sm text-foreground/58">
                  {copy.history.empty}
                </p>
              )}
            </div>
          </article>
        </section>

        <section className="rounded-lg border border-border bg-surface">
          <div className="flex flex-col justify-between gap-3 border-b border-border p-5 md:flex-row md:items-center">
            <div>
              <h2 className="text-lg font-semibold">
                {activeReview?.name ?? copy.items.titleFallback}
              </h2>
              <p className="mt-1 text-sm text-foreground/58">
                {activeReview
                  ? interpolate(copy.items.progress, {
                      reviewed: activeReview.reviewedItems ?? 0,
                      total: activeReview.totalItems ?? 0,
                    })
                  : copy.items.selectOrCreate}
              </p>
            </div>
            {activeReview ? (
              <form action={completeAccessReviewAction.bind(null, activeReview.id)}>
                <button
                  type="submit"
                  disabled={!canMutate || activeReview.status === "completed"}
                  className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-3 text-sm font-medium hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {copy.items.complete}
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </form>
            ) : null}
          </div>

          <div className="divide-y divide-border">
            {activeItems.length ? (
              activeItems.map((item) => (
                <article
                  key={item.id}
                  className="grid gap-4 p-5 xl:grid-cols-[1fr_auto]"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{item.userName}</p>
                      <span className="rounded-md bg-surface-muted px-2 py-1 text-xs text-foreground/64">
                        {item.resource}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-foreground/58">
                      {item.userEmail ?? copy.items.noEmail} · {item.accessLevel}
                    </p>
                    <p className="mt-1 text-sm text-foreground/58">
                      {copy.items.decision}: {decisionLabel(item.decision, copy)}
                    </p>
                  </div>
                  <form
                    action={updateAccessReviewDecisionAction.bind(
                      null,
                      activeReview?.id ?? "",
                      item.id,
                    )}
                    className="flex flex-wrap gap-2"
                  >
                    {(["keep", "modify", "revoke"] as const).map((decision) => (
                      <button
                        key={decision}
                        name="decision"
                        value={decision}
                        type="submit"
                        disabled={!canMutate || activeReview?.status === "completed"}
                        className={`min-w-20 rounded-md px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50 ${decisionClass(
                          item.decision,
                          decision,
                        )}`}
                      >
                        {decisionLabel(decision, copy)}
                      </button>
                    ))}
                  </form>
                </article>
              ))
            ) : (
              <p className="p-5 text-sm text-foreground/58">
                {copy.items.empty}
              </p>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
