import { PlaceholderPage } from "@/components/app/placeholder-page";

export default function BillingSettingsPage() {
  return (
    <PlaceholderPage
      title="Billing"
      description="Stripe subscription stav a synchronizace plánu do Neon i Clerk metadat."
      items={["customer", "subscription", "plan gate"]}
    />
  );
}
