import type { Metadata } from "next";
import Link from "next/link";
import { getLocale } from "next-intl/server";
import { Icon } from "@/components/marketing/local-icon";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { CollectionPageJsonLd } from "@/components/marketing/structured-data";
import { getLocalizedMarketingPath } from "@/i18n/marketing-paths";
import { normalizeLocale } from "@/i18n/routing";
import { getBlogPageCopy, getBlogPosts } from "@/lib/marketing/blog";
import { createMarketingMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = normalizeLocale(await getLocale()) ?? "cs-CZ";
  const copy = getBlogPageCopy(locale);

  return createMarketingMetadata({
    description: copy.jsonLdDescription,
    locale,
    path: "/blog",
    title: copy.metadataTitle,
  });
}

export default async function BlogPage() {
  const locale = normalizeLocale(await getLocale()) ?? "cs-CZ";
  const copy = getBlogPageCopy(locale);
  const posts = getBlogPosts(locale);

  return (
    <MarketingShell>
      <CollectionPageJsonLd
        name="Splnit.eu Blog"
        path={getLocalizedMarketingPath("/blog", locale)}
        description={copy.jsonLdDescription}
      />
      <main>
        <section data-hero className="px-5 pb-16 pt-32">
          <div className="mx-auto max-w-5xl">
            <span className="section-tag mb-5">{copy.tag}</span>
            <h1 className="text-5xl font-semibold leading-[1.05] tracking-[-0.04em] text-zinc-900 md:text-[68px]">
              {copy.title}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-500">
              {copy.description}
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
                    href={getLocalizedMarketingPath(`/blog/${post.slug}`, locale)}
                    className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    {copy.readArticle}
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
