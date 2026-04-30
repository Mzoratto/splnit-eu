import { PlaceholderPage } from "@/components/app/placeholder-page";
import { FRAMEWORK_LIBRARY } from "@/lib/frameworks/registry";

export default function FrameworksPage() {
  return (
    <PlaceholderPage
      title="Frameworky"
      description="Přehled regulací a standardů, do kterých je organizace přihlášená."
      items={FRAMEWORK_LIBRARY.map(
        (framework) => `${framework.nameCs} - ${framework.regulator}`,
      )}
    />
  );
}
