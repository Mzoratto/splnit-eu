import { notFound } from "next/navigation";
import { FrameworkAssessmentWizard } from "@/components/frameworks/framework-assessment-wizard";
import { getQuestionsForFramework } from "@/lib/frameworks/questions";
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
    <FrameworkAssessmentWizard
      framework={framework}
      questions={getQuestionsForFramework(framework.slug)}
    />
  );
}
