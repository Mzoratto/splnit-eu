import { PlaceholderPage } from "@/components/app/placeholder-page";

export default function RisksPage() {
  return (
    <PlaceholderPage
      title="Risk register"
      description="Evidence rizik s likelihood, impact, score, vlastníkem a termínem mitigace."
      items={["likelihood x impact", "owner", "mitigation status"]}
    />
  );
}
