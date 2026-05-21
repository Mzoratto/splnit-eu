import { redirect } from "next/navigation";

export default async function SettingsProfilePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = searchParams ? await searchParams : {};
  const query = new URLSearchParams();
  const testProfile = Array.isArray(params.testProfile)
    ? params.testProfile[0]
    : params.testProfile;

  if (testProfile) {
    query.set("testProfile", testProfile);
  }

  redirect(`/settings/organisation${query.size > 0 ? `?${query}` : ""}`);
}
