import { notFound } from "next/navigation";
import { PlaceholderPage } from "@/components/app/placeholder-page";
import { FRAMEWORK_LIBRARY } from "@/lib/frameworks/registry";

export default async function FrameworkSetupPage({
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
      title={`${framework.nameCs} setup`}
      description="Wizard bude používat stejné kontrolní mapování jako seed data a vygeneruje gap report pro zákazníka."
      items={[
        "Kategorizace organizace a rozsahu",
        "Výběr relevantních systémů a integrací",
        "První výpočet stavu kontrol a evidence",
      ]}
    />
  );
}
