import { TemplateCard } from "@/components/templates/template-card";
import {
  getTemplatesByFramework,
  getTemplatesByRegulation,
} from "@/lib/marketing/templates";

type TemplateSectionProps = {
  regulationSlug?: string;
  frameworkSlug?: string;
  variant?: "public" | "app";
};

export function TemplateSection({
  regulationSlug,
  frameworkSlug,
  variant = "app",
}: TemplateSectionProps) {
  const templates = regulationSlug
    ? getTemplatesByRegulation(regulationSlug)
    : frameworkSlug
      ? getTemplatesByFramework(frameworkSlug)
      : [];

  if (templates.length === 0) {
    return null;
  }

  const content = (
    <>
      <div className={variant === "public" ? "mb-10" : "space-y-2"}>
        {variant === "public" ? (
          <span className="section-tag mb-5">Šablony</span>
        ) : null}
        <h2
          className={
            variant === "public"
              ? "text-3xl font-semibold tracking-[-0.03em] text-zinc-900"
              : "text-lg font-medium"
          }
        >
          Šablony a dokumenty ke stažení
        </h2>
        <p
          className={
            variant === "public"
              ? "mt-3 max-w-2xl text-sm leading-6 text-zinc-500"
              : "max-w-2xl text-sm leading-6 text-foreground/64"
          }
        >
          Připravené šablony pro vaši implementaci. Stáhněte, upravte a použijte
          ve své firmě.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <TemplateCard key={template.id} template={template} />
        ))}
      </div>

      <p
        className={
          variant === "public"
            ? "mt-5 text-xs leading-5 text-zinc-500"
            : "mt-5 text-xs leading-5 text-foreground/58"
        }
      >
        Šablony jsou obecné vzory. Upravte je podle specifik vaší organizace.
        Splnit.eu nenese odpovědnost za jejich právní přesnost.
      </p>
    </>
  );

  if (variant === "public") {
    return (
      <section className="border-t border-zinc-200/50 bg-white py-16">
        <div className="mx-auto max-w-7xl px-5">{content}</div>
      </section>
    );
  }

  return <section className="space-y-5">{content}</section>;
}
