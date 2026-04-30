import { notFound } from "next/navigation";
import { PlaceholderPage } from "@/components/app/placeholder-page";
import { CONTROL_LIBRARY } from "@/lib/controls/library";

export default async function ControlDetailPage({
  params,
}: {
  params: Promise<{ controlId: string }>;
}) {
  const { controlId } = await params;
  const control = CONTROL_LIBRARY.find((item) => item.key === controlId);

  if (!control) {
    notFound();
  }

  return (
    <PlaceholderPage
      title={control.titleCs}
      description={control.descriptionCs ?? control.titleEn}
      items={[
        `Kategorie: ${control.category}`,
        `Test: ${control.testType}`,
        `Evidence: ${control.requiresEvidence ? "vyžadována" : "není vyžadována"}`,
      ]}
    />
  );
}
