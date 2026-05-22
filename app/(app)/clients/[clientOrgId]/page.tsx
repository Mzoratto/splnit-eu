import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ clientOrgId: string }>;
};

export default async function ClientCompatibilityRedirect({ params }: PageProps) {
  const { clientOrgId } = await params;

  redirect(`/agency/clients/${encodeURIComponent(clientOrgId)}`);
}
