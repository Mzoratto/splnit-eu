import { MarketingShell } from "@/components/marketing/marketing-shell";

export type LegalSection = {
  body: string[];
  title: string;
};

export function LegalPage({
  intro,
  sections,
  title,
}: {
  intro: string;
  sections: LegalSection[];
  title: string;
}) {
  return (
    <MarketingShell>
      <main className="px-5 pb-20 pt-32">
        <article className="mx-auto max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-primary">
            Splnit.eu
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-normal text-zinc-900">
            {title}
          </h1>
          <p className="mt-5 text-base leading-7 text-zinc-600">{intro}</p>

          <div className="mt-10 space-y-8">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="text-xl font-semibold text-zinc-900">
                  {section.title}
                </h2>
                <div className="mt-3 space-y-3 text-sm leading-7 text-zinc-600">
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </article>
      </main>
    </MarketingShell>
  );
}
