import { PlaceholderPage } from "@/components/app/placeholder-page";

export default async function VendorDetailPage({
  params,
}: {
  params: Promise<{ vendorId: string }>;
}) {
  const { vendorId } = await params;

  return (
    <PlaceholderPage
      title={`Dodavatel ${vendorId}`}
      description="Detail assessmentu dodavatele s odpověďmi, skóre, vlastníkem a příští revizí."
      items={["questionnaire", "risk tier", "review workflow"]}
    />
  );
}
