import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@iconify/react";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { SoftwareApplicationJsonLd } from "@/components/marketing/software-json-ld";
import {
  frameworkDetails,
  getFrameworkDetail,
} from "@/lib/marketing/frameworks";

export function generateStaticParams() {
  return frameworkDetails.map((framework) => ({ slug: framework.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const framework = getFrameworkDetail(slug);

  if (!framework) {
    return {};
  }

  return {
    title: `${framework.name} | Splnit.eu — povinnosti, termíny a automatizace souladu`,
    description: `${framework.name}: český přehled povinností, sankcí a kroků k souladu pro MSP.`,
    openGraph: {
      locale: "cs_CZ",
    },
  };
}

export default async function RegulationDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const framework = getFrameworkDetail(slug);

  if (!framework) {
    notFound();
  }

  return (
    <MarketingShell>
      <SoftwareApplicationJsonLd
        pageName={`Splnit.eu ${framework.name}`}
        path={`/predpisy/${framework.slug}`}
        description={`${framework.name}: český přehled povinností a automatizace souladu v platformě Splnit.eu.`}
      />
      <main>
        <section data-hero className="px-5 pb-16 pt-32">
          <div className="mx-auto max-w-5xl">
            <Link
              href="/predpisy"
              className="mb-8 inline-flex text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              ← Všechny předpisy
            </Link>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                {framework.regulator}
              </span>
              <span className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600">
                {framework.deadline}
              </span>
              <span className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600">
                {framework.law}
              </span>
            </div>
            <h1 className="mt-6 text-5xl font-semibold leading-[1.05] tracking-[-0.04em] text-zinc-900 md:text-[72px]">
              {framework.name}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-500">
              {framework.hero}
            </p>
          </div>
        </section>

        <section className="border-t border-zinc-200/50 bg-white py-16">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <span className="section-tag mb-5">Kdo to musí splnit</span>
              <h2 className="text-3xl font-semibold tracking-[-0.03em] text-zinc-900">
                Praktický dopad pro české firmy.
              </h2>
            </div>
            <ul className="grid gap-3">
              {framework.appliesTo.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 rounded-2xl border border-zinc-100 bg-zinc-50 p-4 text-sm leading-6 text-zinc-600"
                >
                  <Icon
                    icon="solar:check-circle-linear"
                    className="mt-0.5 shrink-0 text-xl text-blue-600"
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="border-t border-zinc-200/50 py-16">
          <div className="mx-auto max-w-7xl px-5">
            <div className="mb-10">
              <span className="section-tag mb-5">Klíčové povinnosti</span>
              <h2 className="text-3xl font-semibold tracking-[-0.03em] text-zinc-900">
                Co musí být doložitelné.
              </h2>
            </div>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {framework.obligations.map((obligation) => (
                <article
                  key={obligation.title}
                  className="rounded-[22px] p-px grad-border"
                >
                  <div className="h-full rounded-[21px] bg-white p-6">
                    <p className="mono mb-3 text-xs text-blue-600">
                      {obligation.reference}
                    </p>
                    <h3 className="text-lg font-semibold text-zinc-900">
                      {obligation.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-zinc-500">
                      {obligation.description}
                    </p>
                    <p className="mt-5 rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600">
                      Termín: {obligation.deadline}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-zinc-200/50 bg-white py-16">
          <div className="mx-auto max-w-7xl px-5">
            <div className="mb-10">
              <span className="section-tag mb-5">Pokuty a sankce</span>
              <h2 className="text-3xl font-semibold tracking-[-0.03em] text-zinc-900">
                Riziko se měří penězi i ztracenými zakázkami.
              </h2>
            </div>
            <div className="overflow-hidden rounded-[24px] border border-zinc-200">
              <div className="grid grid-cols-3 bg-zinc-50 px-5 py-3 text-xs font-semibold text-zinc-600">
                <span>Typ porušení</span>
                <span>Maximální sankce</span>
                <span>Český dohled</span>
              </div>
              {framework.fines.map((fine) => (
                <div
                  key={fine.violation}
                  className="grid grid-cols-3 border-t border-zinc-100 px-5 py-4 text-sm text-zinc-600"
                >
                  <span className="font-medium text-zinc-900">{fine.violation}</span>
                  <span>{fine.maximum}</span>
                  <span>{fine.enforcer}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-zinc-200/50 py-16">
          <div className="mx-auto max-w-7xl px-5">
            <div className="mb-10">
              <span className="section-tag mb-5">Jak Splnit.eu pomáhá</span>
              <h2 className="text-3xl font-semibold tracking-[-0.03em] text-zinc-900">
                Převod povinností na kontroly, důkazy a termíny.
              </h2>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {framework.splnitHelps.map((item) => (
                <article key={item.title} className="rounded-[22px] p-px grad-border">
                  <div className="h-full rounded-[21px] bg-white p-7">
                    <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Icon icon={item.icon} className="text-2xl" aria-hidden="true" />
                    </div>
                    <h3 className="text-lg font-semibold text-zinc-900">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-zinc-500">
                      {item.description}
                    </p>
                  </div>
                </article>
              ))}
            </div>
            <Link
              href="/platform"
              className="mt-8 inline-flex rounded-full bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500"
            >
              Zobrazit v akci
            </Link>
          </div>
        </section>

        <section className="border-t border-zinc-200/50 bg-white py-16">
          <div className="mx-auto max-w-5xl px-5">
            <div className="rounded-[2rem] border border-blue-100 bg-blue-50/40 p-8 md:p-10">
              <h2 className="text-2xl font-semibold tracking-[-0.03em] text-zinc-900">
                Stáhnout zdroje
              </h2>
              <div className="mt-6 flex flex-wrap gap-2">
                {framework.resources.map((resource) => (
                  <Link
                    key={resource}
                    href={`mailto:hello@splnit.eu?subject=${encodeURIComponent(resource)}`}
                    className="rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:border-blue-200 hover:text-blue-700"
                  >
                    {resource}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </MarketingShell>
  );
}
