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
        <section data-hero className="border-b border-border bg-white px-5 pb-16 pt-36">
          <div className="mx-auto max-w-5xl">
            <span className="section-tag mb-5">{copy.tag}</span>
            <h1 className="text-5xl font-bold leading-[1.05] tracking-normal text-foreground md:text-[68px]">
              {copy.title}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-foreground/62">
              {copy.description}
            </p>
          </div>
        </section>

        <section className="bg-background py-20">
          <div className="mx-auto grid max-w-7xl gap-5 px-5 md:grid-cols-3">
            {posts.map((post) => {
              const postHref = getLocalizedMarketingPath(`/blog/${post.slug}`, locale);
              const titleId = `blog-post-${post.slug}`;

              return (
                <Link
                  key={post.slug}
                  href={postHref}
                  aria-labelledby={titleId}
                  className="scroll-animate group flex h-full translate-y-6 rounded-lg border border-border bg-white opacity-0 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--accent)] hover:shadow-md focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
                >
                  <article className="flex min-h-[420px] w-full flex-col">
                    <div className="h-28 border-b border-border bg-surface-muted" />
                    <div className="flex flex-1 flex-col p-7">
                      <div className="mb-5 flex items-center justify-between gap-3">
                        <span className="rounded-full border border-[var(--color-green-100)] bg-[var(--color-green-050)] px-3 py-1 text-xs font-semibold text-[var(--accent)]">
                          {post.category}
                        </span>
                        <span className="text-xs font-medium text-foreground/42">
                          {post.readTime}
                        </span>
                      </div>
                      <h2
                        id={titleId}
                        className="text-xl font-bold leading-7 text-foreground"
                      >
                        {post.title}
                      </h2>
                      <p className="mt-4 flex-1 text-sm leading-6 text-foreground/62">
                        {post.description}
                      </p>
                      <span className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors group-hover:text-[var(--accent-hover)]">
                        {copy.readArticle}
                        <Icon
                          icon="solar:arrow-right-linear"
                          className="text-base transition-transform group-hover:translate-x-0.5"
                          aria-hidden="true"
                        />
                      </span>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        </section>
      </main>
    </MarketingShell>
  );
}
