import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/marketing/local-icon";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { SoftwareApplicationJsonLd } from "@/components/marketing/software-json-ld";
import { getBlogPosts } from "@/lib/marketing/blog";

export const metadata: Metadata = {
  title: "Blog | Splnit.eu — NIS2, EU AI Act a GDPR pro české firmy",
  description:
    "Praktické návody k NIS2, EU AI Act, GDPR a ISO 27001 pro české MSP.",
  openGraph: {
    locale: "cs_CZ",
  },
};

export default function BlogPage() {
  const posts = getBlogPosts();

  return (
    <MarketingShell>
      <SoftwareApplicationJsonLd
        pageName="Splnit.eu Blog"
        path="/blog"
        description="Praktické návody Splnit.eu k NIS2, EU AI Act, GDPR a ISO 27001 pro české firmy."
      />
      <main>
        <section data-hero className="px-5 pb-16 pt-32">
          <div className="mx-auto max-w-5xl">
            <span className="section-tag mb-5">Compliance průvodce</span>
            <h1 className="text-5xl font-semibold leading-[1.05] tracking-[-0.04em] text-zinc-900 md:text-[68px]">
              Návody pro EU compliance bez právního šumu.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-500">
              Praktické články pro české firmy, které potřebují proměnit NIS2,
              EU AI Act a GDPR na kontroly, důkazy a odpovědnosti.
            </p>
          </div>
        </section>

        <section className="border-t border-zinc-200/50 bg-white py-20">
          <div className="mx-auto grid max-w-7xl gap-5 px-5 md:grid-cols-3">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="scroll-animate translate-y-6 rounded-[22px] p-px opacity-0 grad-border"
              >
                <div className="flex h-full flex-col rounded-[21px] bg-white p-7">
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                      {post.category}
                    </span>
                    <span className="text-xs font-medium text-zinc-400">
                      {post.readTime}
                    </span>
                  </div>
                  <h2 className="text-xl font-semibold leading-7 text-zinc-900">
                    {post.title}
                  </h2>
                  <p className="mt-4 flex-1 text-sm leading-6 text-zinc-500">
                    {post.description}
                  </p>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    Číst článek
                    <Icon
                      icon="solar:arrow-right-linear"
                      className="text-base"
                      aria-hidden="true"
                    />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </MarketingShell>
  );
}
