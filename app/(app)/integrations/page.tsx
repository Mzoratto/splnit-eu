import { PlaceholderPage } from "@/components/app/placeholder-page";

export default function IntegrationsPage() {
  return (
    <PlaceholderPage
      title="Integrace"
      description="Hub pro automatické testy. První implementovaný adapter je Microsoft 365."
      items={[
        "Microsoft 365: MFA, Conditional Access, hosté, privilegované role",
        "GitHub: branch protection, secret scanning, 2FA enforcement",
        "NÚKIB: synchronizace varování a zranitelností",
      ]}
    />
  );
}
