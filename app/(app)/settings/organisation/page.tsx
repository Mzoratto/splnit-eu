import { PlaceholderPage } from "@/components/app/placeholder-page";

export default function OrganisationSettingsPage() {
  return (
    <PlaceholderPage
      title="Organizace"
      description="IČO, sektor, velikost organizace, Clerk org vazba a NIS2 kategorizace."
      items={["clerk_org_id", "sector", "employee_count"]}
    />
  );
}
