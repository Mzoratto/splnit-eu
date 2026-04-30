import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import {
  CheckCircle2,
  Download,
  GitBranch,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { hasDatabaseUrl } from "@/lib/db";
import {
  getAccessReviewDetail,
  listAccessReviewsForOrg,
} from "@/lib/db/queries/access-reviews";
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

async function loadAccessReviews(selectedReviewId?: string) {
  const clerkConfigured =
    Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
    Boolean(process.env.CLERK_SECRET_KEY);

  if (!clerkConfigured || !hasDatabaseUrl()) {
    return getDemoData();
  }

  const session = await auth();

  if (!session.orgId) {
    return getDemoData();
  }

  const reviews = await listAccessReviewsForOrg(session.orgId).catch(() => []);
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
    reviews,
  };
}

function getDemoData(): {
  canMutate: boolean;
  detail: ReviewDetail;
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
    name: "Quarterly access review · Microsoft 365 + GitHub",
    provider: "all",
    reviewedItems: 2,
    status: "in_progress",
    totalItems: 4,
  } satisfies Review;
  const items = [
    {
      accessLevel: "Member · enabled",
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
      accessLevel: "Guest · enabled",
      clerkOrgId: "demo",
      decidedAt: null,
      decidedBy: null,
      decision: null,
      id: "demo-2",
      resource: "Microsoft Entra ID",
      reviewId: review.id,
      userEmail: "vendor@example.com",
      userName: "Vendor User",
    },
    {
      accessLevel: "User",
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
      accessLevel: "User",
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
    reviews: [review],
  };
}

function formatDate(value: Date | string | null | undefined) {
  if (!value) {
    return "nenastaveno";
  }

  return new Intl.DateTimeFormat("cs-CZ").format(new Date(value));
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

export default async function AccessReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ reviewId?: string }>;
}) {
  const { reviewId } = await searchParams;
  const { canMutate, detail, reviews } = await loadAccessReviews(reviewId);
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
            Access reviews
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">
            Přístupové revize
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground/64">
            Pull Entra ID a GitHub uživatelů, rozhodnutí keep/revoke/modify a CSV evidence pro ISO 27001 A.9.2.3.
          </p>
        </div>
        {activeReview ? (
          <a
            href={`/api/access-reviews/${activeReview.id}/export`}
            className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-3 text-sm font-medium hover:bg-surface-muted"
          >
            Export CSV
            <Download className="h-4 w-4" aria-hidden="true" />
          </a>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-lg border border-border bg-surface p-5">
          <div className="flex items-center gap-2">
            <UsersRound className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-lg font-semibold">Aktivní revize</h2>
          </div>
          <p className="mt-4 font-mono text-2xl font-semibold">
            {reviews.filter((review) => review.status !== "completed").length}
          </p>
          <p className="mt-2 text-sm text-foreground/58">
            Posledních {reviews.length} revizí v historii.
          </p>
        </article>
        <article className="rounded-lg border border-border bg-surface p-5">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-lg font-semibold">Progress</h2>
          </div>
          <p className="mt-4 font-mono text-2xl font-semibold">{progress}%</p>
          <p className="mt-2 text-sm text-foreground/58">
            {activeReview?.reviewedItems ?? 0} / {activeReview?.totalItems ?? 0} rozhodnutí.
          </p>
        </article>
        <article className="rounded-lg border border-border bg-surface p-5">
          <div className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-lg font-semibold">Provider</h2>
          </div>
          <p className="mt-4 font-mono text-2xl font-semibold">
            {activeReview?.provider ?? "none"}
          </p>
          <p className="mt-2 text-sm text-foreground/58">
            Due {formatDate(activeReview?.dueDate)}
          </p>
        </article>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.78fr_1.4fr]">
        <section className="space-y-4">
          <article className="rounded-lg border border-border bg-surface p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
              <h2 className="text-lg font-semibold">Start review</h2>
            </div>
            <form action={startAccessReviewAction} className="mt-5 space-y-4">
              <label className="grid gap-2 text-sm">
                Název
                <input
                  name="name"
                  placeholder="Quarterly access review"
                  disabled={!canMutate}
                  className="rounded-md border border-border bg-background px-3 py-2"
                />
              </label>
              <label className="grid gap-2 text-sm">
                Provider
                <select
                  name="provider"
                  defaultValue="all"
                  disabled={!canMutate}
                  className="rounded-md border border-border bg-background px-3 py-2"
                >
                  <option value="all">Microsoft 365 + GitHub</option>
                  <option value="microsoft365">Microsoft 365</option>
                  <option value="github">GitHub</option>
                </select>
              </label>
              <label className="grid gap-2 text-sm">
                Due date
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
                Načíst uživatele
                <UsersRound className="h-4 w-4" aria-hidden="true" />
              </button>
            </form>
          </article>

          <article className="rounded-lg border border-border bg-surface">
            <div className="border-b border-border p-5">
              <h2 className="text-lg font-semibold">Historie</h2>
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
                        {review.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-foreground/58">
                      {review.provider} · {review.reviewedItems ?? 0}/{review.totalItems ?? 0}
                    </p>
                  </Link>
                ))
              ) : (
                <p className="p-5 text-sm text-foreground/58">
                  Zatím není založená žádná přístupová revize.
                </p>
              )}
            </div>
          </article>
        </section>

        <section className="rounded-lg border border-border bg-surface">
          <div className="flex flex-col justify-between gap-3 border-b border-border p-5 md:flex-row md:items-center">
            <div>
              <h2 className="text-lg font-semibold">
                {activeReview?.name ?? "Review items"}
              </h2>
              <p className="mt-1 text-sm text-foreground/58">
                {activeReview ? `${activeReview.reviewedItems ?? 0}/${activeReview.totalItems ?? 0} rozhodnutí` : "Vyberte nebo založte revizi."}
              </p>
            </div>
            {activeReview ? (
              <form action={completeAccessReviewAction.bind(null, activeReview.id)}>
                <button
                  type="submit"
                  disabled={!canMutate || activeReview.status === "completed"}
                  className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-3 text-sm font-medium hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Uzavřít review
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
                      {item.userEmail ?? "bez emailu"} · {item.accessLevel}
                    </p>
                    <p className="mt-1 text-sm text-foreground/58">
                      Rozhodnutí: {item.decision ?? "pending"}
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
                        {decision}
                      </button>
                    ))}
                  </form>
                </article>
              ))
            ) : (
              <p className="p-5 text-sm text-foreground/58">
                Připojte Microsoft 365 nebo GitHub a založte review.
              </p>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
