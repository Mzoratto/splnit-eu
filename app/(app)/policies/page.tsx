import { PlaceholderPage } from "@/components/app/placeholder-page";
import { POLICY_TEMPLATES } from "@/lib/policies/templates";

export default function PoliciesPage() {
  return (
    <PlaceholderPage
      title="Policy library"
      description="České dokumentové šablony převedené do strukturovaných dat pro budoucí @react-pdf/renderer."
      items={POLICY_TEMPLATES.map((template) => `${template.type}: ${template.titleCs}`)}
    />
  );
}
