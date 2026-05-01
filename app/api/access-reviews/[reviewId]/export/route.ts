import { auth } from "@clerk/nextjs/server";
import { getAccessReviewDetail } from "@/lib/db/queries/access-reviews";
import { privateJson, withPrivateNoStore } from "@/lib/http/private-response";

function csvCell(value: Date | string | null | undefined) {
  const text = value instanceof Date ? value.toISOString() : value ?? "";
  return `"${String(text).replace(/"/g, '""')}"`;
}

function safeFilename(name: string) {
  return `${name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)}.csv`;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ reviewId: string }> },
) {
  const session = await auth();

  if (!session.userId || !session.orgId) {
    return privateJson({ error: "Unauthorized" }, { status: 401 });
  }

  const { reviewId } = await params;
  const detail = await getAccessReviewDetail({
    clerkOrgId: session.orgId,
    reviewId,
  });

  if (!detail) {
    return privateJson({ error: "Access review not found" }, { status: 404 });
  }

  const header = [
    "review_name",
    "provider",
    "user_name",
    "user_email",
    "resource",
    "access_level",
    "decision",
    "decided_by",
    "decided_at",
  ];
  const rows = detail.items.map((item) => [
    detail.review.name,
    detail.review.provider,
    item.userName,
    item.userEmail,
    item.resource,
    item.accessLevel,
    item.decision,
    item.decidedBy,
    item.decidedAt,
  ]);
  const csv = [header, ...rows]
    .map((row) => row.map((cell) => csvCell(cell)).join(","))
    .join("\n");

  return new Response(csv, {
    headers: withPrivateNoStore({
      "Content-Disposition": `attachment; filename="${safeFilename(
        detail.review.name,
      )}"`,
      "Content-Type": "text/csv; charset=utf-8",
    }),
  });
}
