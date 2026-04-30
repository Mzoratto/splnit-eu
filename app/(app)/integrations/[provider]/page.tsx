import { PlaceholderPage } from "@/components/app/placeholder-page";

export default async function IntegrationDetailPage({
  params,
}: {
  params: Promise<{ provider: string }>;
}) {
  const { provider } = await params;

  return (
    <PlaceholderPage
      title={`Integrace: ${provider}`}
      description="Detail připojení bude řešit OAuth, status tokenů, poslední sync a poslední chybu."
      items={[
        "OAuth callback ukládá šifrované tokeny",
        "Runner spouští testy podle checkLogic",
        "Výsledky aktualizují org_control_statuses",
      ]}
    />
  );
}
