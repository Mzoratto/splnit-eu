import { notFound } from "next/navigation";
import { PlaceholderPage } from "@/components/app/placeholder-page";
import { FRAMEWORK_LIBRARY } from "@/lib/frameworks/registry";

export default async function FrameworkDetailPage({
  params,
}: {
  params: Promise<{ frameworkSlug: string }>;
}) {
  const { frameworkSlug } = await params;
  const framework = FRAMEWORK_LIBRARY.find((item) => item.slug === frameworkSlug);

  if (!framework) {
    notFound();
  }

  return (
    <PlaceholderPage
      title={framework.nameCs}
      description={framework.descriptionCs}
      items={[
        `Regulator: ${framework.regulator}`,
        `Verze: ${framework.version}`,
        `Termín: ${framework.mandatoryDeadline ?? "průběžně"}`,
      ]}
    />
  );
}
