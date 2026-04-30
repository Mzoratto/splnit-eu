import { PlaceholderPage } from "@/components/app/placeholder-page";
import { CONTROL_LIBRARY } from "@/lib/controls/library";

export default function ControlsPage() {
  return (
    <PlaceholderPage
      title="Kontroly"
      description="Globální knihovna kontrol, která umožňuje cross-mapping mezi frameworky."
      items={CONTROL_LIBRARY.slice(0, 9).map(
        (control) => `${control.key}: ${control.titleCs}`,
      )}
    />
  );
}
