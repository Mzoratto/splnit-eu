import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { hasDatabaseUrl } from "@/lib/db";
import { getAgencyForUser } from "@/lib/db/queries/agencies";

export default async function AgencyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session.userId) {
    redirect("/sign-in");
  }

  if (!hasDatabaseUrl()) {
    redirect("/dashboard");
  }

  const membership = await getAgencyForUser(session.userId);

  if (!membership) {
    redirect("/dashboard");
  }

  return children;
}
