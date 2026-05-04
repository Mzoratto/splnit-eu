import type { Metadata } from "next";
import Link from "next/link";
import { getLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Icon } from "@/components/marketing/local-icon";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { SoftwareApplicationJsonLd } from "@/components/marketing/software-json-ld";
import { normalizeLocale } from "@/i18n/routing";
import {
  getBlogPageCopy,
  getBlogPost,
  getBlogPosts,
} from "@/lib/marketing/blog";

export function generateStaticParams() {
  return getBlogPosts().map((post) => ({ slug: post.slug }));
}

function sectionId(heading: string) {
  return heading.toLowerCase().replaceAll(" ", "-");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const locale = normalizeLocale(await getLocale()) ?? "cs-CZ";
  const pageCopy = getBlogPageCopy(locale);
  const post = getBlogPost(slug, locale);

  if (!post) {
    return {};
  }

  return {
    title: `${post.title} | Splnit.eu Blog`,
    description: post.description,
    openGraph: {
      locale: pageCopy.locale,
      type: "article",
      publishedTime: post.publishedAt,
      title: post.title,
      description: post.description,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const locale = normalizeLocale(await getLocale()) ?? "cs-CZ";
  const pageCopy = getBlogPageCopy(locale);
  const post = getBlogPost(slug, locale);

  if (!post) {
    notFound();
  }

  return (
    <MarketingShell>
      <SoftwareApplicationJsonLd
        pageName={`Splnit.eu Blog: ${post.category}`}
        path={`/blog/${post.slug}`}
        description={post.description}
      />
      <main>
        <article>
          <section data-hero className="px-5 pb-12 pt-32">
            <div className="mx-auto max-w-4xl">
              <Link
                href="/blog"
                className="mb-8 inline-flex text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                {pageCopy.allArticles}
              </Link>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                  {post.category}
                </span>
                <span className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600">
                  {post.readTime}
                </span>
                <time
                  dateTime={post.publishedAt}
                  className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600"
                >
                  {new Intl.DateTimeFormat(locale, {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }).format(new Date(post.publishedAt))}
                </time>
              </div>
              <h1 className="mt-6 text-5xl font-semibold leading-[1.05] tracking-[-0.04em] text-zinc-900 md:text-[68px]">
                {post.title}
              </h1>
              <p className="mt-6 text-lg leading-8 text-zinc-500">{post.summary}</p>
            </div>
          </section>

          <section className="border-t border-zinc-200/50 bg-white px-5 py-16">
            <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-[220px_1fr]">
              <aside className="hidden lg:block">
                <div className="sticky top-24 rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
                  <p className="mono text-xs font-medium uppercase text-zinc-400">
                    {pageCopy.articleNavTitle}
                  </p>
                  <nav className="mt-4 grid gap-3">
                    {post.sections.map((section) => (
                      <a
                        key={section.heading}
                        href={`#${sectionId(section.heading)}`}
                        className="text-sm font-medium text-zinc-600 hover:text-blue-700"
                      >
                        {section.heading}
                      </a>
                    ))}
                  </nav>
                </div>
              </aside>

              <div className="space-y-12">
                {post.sections.map((section) => (
                  <section
                    key={section.heading}
                    id={sectionId(section.heading)}
                    className="scroll-mt-24"
                  >
                    <h2 className="text-3xl font-semibold tracking-[-0.03em] text-zinc-900">
                      {section.heading}
                    </h2>
                    <div className="mt-5 space-y-4">
                      {section.body.map((paragraph) => (
                        <p
                          key={paragraph}
                          className="text-base leading-8 text-zinc-600"
                        >
                          {paragraph}
                        </p>
                      ))}
                    </div>
                    {section.bullets ? (
                      <ul className="mt-6 grid gap-3">
                        {section.bullets.map((bullet) => (
                          <li
                            key={bullet}
                            className="flex items-start gap-3 rounded-2xl border border-zinc-100 bg-zinc-50 p-4 text-sm leading-6 text-zinc-600"
                          >
                            <Icon
                              icon="solar:check-circle-linear"
                              className="mt-0.5 shrink-0 text-xl text-blue-600"
                              aria-hidden="true"
                            />
                            {bullet}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </section>
                ))}

                <div className="rounded-[2rem] border border-blue-100 bg-blue-50/40 p-8">
                  <h2 className="text-2xl font-semibold tracking-[-0.03em] text-zinc-900">
                    {pageCopy.articleCtaTitle}
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">
                    {pageCopy.articleCtaBody}
                  </p>
                  <Link
                    href="/platform"
                    className="mt-6 inline-flex rounded-full bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500"
                  >
                    {pageCopy.articleCtaButton}
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </article>
      </main>
    </MarketingShell>
  );
}
