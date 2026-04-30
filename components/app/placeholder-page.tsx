import { ArrowRight } from "lucide-react";

type PlaceholderPageProps = {
  title: string;
  description: string;
  items?: string[];
};

export function PlaceholderPage({
  title,
  description,
  items = [],
}: PlaceholderPageProps) {
  return (
    <section className="space-y-6">
      <div className="max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-[0.14em] text-primary">
          Splnit.eu
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal">{title}</h1>
        <p className="mt-3 text-base leading-7 text-foreground/68">{description}</p>
      </div>
      {items.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-3">
          {items.map((item) => (
            <div
              key={item}
              className="flex min-h-24 items-start gap-3 rounded-lg border border-border bg-surface p-4"
            >
              <ArrowRight className="mt-1 h-4 w-4 text-primary" aria-hidden="true" />
              <p className="text-sm leading-6 text-foreground/76">{item}</p>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
