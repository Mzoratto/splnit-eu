import { notFound } from "next/navigation";
import { PlaceholderPage } from "@/components/app/placeholder-page";
import { POLICY_TEMPLATES } from "@/lib/policies/templates";

export default async function PolicyDetailPage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  const template = POLICY_TEMPLATES.find((item) => item.type === type);

  if (!template) {
    notFound();
  }

  return (
    <PlaceholderPage
      title={template.titleCs}
      description={template.description}
      items={template.sections.map((section) => section.title)}
    />
  );
}
