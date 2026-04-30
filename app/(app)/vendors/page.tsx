import { PlaceholderPage } from "@/components/app/placeholder-page";

export default function VendorsPage() {
  return (
    <PlaceholderPage
      title="Dodavatelé"
      description="Vendor risk modul bude evidovat dodavatele, risk tier, assessment a termíny revizí."
      items={["cloud", "saas", "hr", "finance", "security"]}
    />
  );
}
