import type { Metadata } from "next";
import Link from "next/link";
import { getLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Icon } from "@/components/marketing/local-icon";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { BlogPostingJsonLd } from "@/components/marketing/structured-data";
import { getLocalizedMarketingPath } from "@/i18n/marketing-paths";
import { locales, normalizeLocale, type Locale } from "@/i18n/routing";
import {
  getBlogPageCopy,
  getBlogPost,
  getBlogPosts,
} from "@/lib/marketing/blog";
import { absoluteUrl, createMarketingMetadata } from "@/lib/seo/metadata";

export function generateStaticParams() {
  return getBlogPosts().map((post) => ({ slug: post.slug }));
}

function sectionId(heading: string) {
  return heading.toLowerCase().replaceAll(" ", "-");
}

const blogHreflangLocales: Record<Locale, string> = {
  "cs-CZ": "cs-CZ",
  "en-EU": "en",
  "it-IT": "it-IT",
};

function getBlogPostAlternates(slug: string) {
  const languages: Record<string, string> = {};

  for (const locale of locales) {
    if (!getBlogPost(slug, locale)) {
      continue;
    }

    languages[blogHreflangLocales[locale]] = absoluteUrl(
      getLocalizedMarketingPath(`/blog/${slug}`, locale),
    );
  }

  languages["x-default"] =
    languages[blogHreflangLocales["cs-CZ"]] ?? languages[blogHreflangLocales["en-EU"]];

  return languages;
}

function BlogBullets({ bullets }: { bullets: string[] }) {
  return (
    <ul className="mt-6 grid gap-3">
      {bullets.map((bullet) => (
        <li
          key={bullet}
          className="flex items-start gap-3 rounded-lg border border-border bg-surface-muted p-4 text-sm leading-6 text-foreground/68"
        >
          <Icon
            icon="solar:check-circle-linear"
            className="mt-0.5 shrink-0 text-xl text-primary"
            aria-hidden="true"
          />
          {bullet}
        </li>
      ))}
    </ul>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const locale = normalizeLocale(await getLocale()) ?? "cs-CZ";
  const post = getBlogPost(slug, locale);

  if (!post) {
    return {};
  }

  const metadata = createMarketingMetadata({
    description: post.description,
    locale,
    path: `/blog/${post.slug}`,
    publishedTime: post.publishedAt,
    title: `${post.title} | Splnit.eu Blog`,
    type: "article",
  });

  metadata.alternates = {
    ...metadata.alternates,
    languages: getBlogPostAlternates(post.slug),
  };

  return metadata;
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
      <BlogPostingJsonLd
        headline={post.title}
        path={getLocalizedMarketingPath(`/blog/${post.slug}`, locale)}
        description={post.description}
        publishedAt={post.publishedAt}
      />
      <main>
        <article>
          <section data-hero className="border-b border-border bg-white px-5 pb-12 pt-36">
            <div className="mx-auto max-w-3xl">
              <Link
                href={getLocalizedMarketingPath("/blog", locale)}
                className="mb-8 inline-flex text-sm font-semibold text-primary hover:text-[var(--accent-hover)]"
              >
                {pageCopy.allArticles}
              </Link>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  {post.category}
                </span>
                <span className="rounded-full border border-border bg-white px-3 py-1 text-xs font-semibold text-foreground/62">
                  {post.readTime}
                </span>
                <time
                  dateTime={post.publishedAt}
                  className="rounded-full border border-border bg-white px-3 py-1 text-xs font-semibold text-foreground/62"
                >
                  {new Intl.DateTimeFormat(locale, {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }).format(new Date(post.publishedAt))}
                </time>
              </div>
              <h1 className="mt-6 text-5xl font-bold leading-[1.05] tracking-normal text-foreground md:text-[68px]">
                {post.title}
              </h1>
              <p className="mt-6 text-lg leading-8 text-foreground/62">{post.summary}</p>
              <p className="mt-4 text-sm font-medium text-foreground/58">
                {post.author && post.authorRole
                  ? `Autor: ${post.author}, ${post.authorRole}`
                  : pageCopy.articleAuthorFallback}
              </p>
            </div>
          </section>

          <section className="bg-white px-5 py-16">
            <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-[220px_minmax(0,680px)]">
              <aside className="hidden lg:block">
                <div className="sticky top-24 rounded-lg border border-border bg-surface-muted p-5">
                  <p className="mono text-xs font-semibold uppercase text-foreground/45">
                    {pageCopy.articleNavTitle}
                  </p>
                  <nav className="mt-4 grid gap-3">
                    {post.sections.map((section) => (
                      <a
                        key={section.heading}
                        href={`#${sectionId(section.heading)}`}
                        className="text-sm font-semibold text-foreground/62 hover:text-primary"
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
                    <h2 className="text-3xl font-bold tracking-normal text-foreground">
                      {section.heading}
                    </h2>
                    <div className="mt-5 space-y-4">
                      {section.body.map((paragraph) => (
                        <p
                          key={paragraph}
                          className="text-base leading-8 text-foreground/68"
                        >
                          {paragraph}
                        </p>
                      ))}
                    </div>
                    {section.bullets ? (
                      <BlogBullets bullets={section.bullets} />
                    ) : null}
                    {section.table ? (
                      <div className="mt-6 overflow-x-auto rounded-2xl border border-zinc-200">
                        <table className="w-full min-w-[620px] border-collapse text-left text-sm">
                          <thead className="bg-zinc-50 text-xs uppercase tracking-[0.08em] text-zinc-500">
                            <tr>
                              {section.table.headers.map((header) => (
                                <th key={header} className="px-4 py-3 font-semibold">
                                  {header}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-100">
                            {section.table.rows.map((row) => (
                              <tr key={row.join("|")}>
                                {row.map((cell) => (
                                  <td key={cell} className="px-4 py-3 leading-6 text-zinc-600">
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : null}
                    {section.codeBlock ? (
                      <pre className="mt-6 overflow-x-auto rounded-2xl border border-zinc-200 bg-zinc-950 p-5 text-sm leading-7 text-zinc-100">
                        <code>{section.codeBlock}</code>
                      </pre>
                    ) : null}
                    {section.subsections?.map((subsection) => (
                      <div key={subsection.heading} className="mt-8">
                        <h3 className="text-xl font-bold tracking-normal text-foreground">
                          {subsection.heading}
                        </h3>
                        <div className="mt-4 space-y-4">
                          {subsection.body.map((paragraph) => (
                            <p
                              key={paragraph}
                              className="text-base leading-8 text-foreground/68"
                            >
                              {paragraph}
                            </p>
                          ))}
                        </div>
                        {subsection.bullets ? (
                          <BlogBullets bullets={subsection.bullets} />
                        ) : null}
                        {subsection.codeBlock ? (
                          <pre className="mt-6 overflow-x-auto rounded-2xl border border-zinc-200 bg-zinc-950 p-5 text-sm leading-7 text-zinc-100">
                            <code>{subsection.codeBlock}</code>
                          </pre>
                        ) : null}
                      </div>
                    ))}
                  </section>
                ))}

                {post.regulationHref ? (
                  <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-5">
                    <p className="text-sm font-semibold text-zinc-900">
                      {pageCopy.relatedRegulationTitle}
                    </p>
                    <Link
                      href={getLocalizedMarketingPath(post.regulationHref, locale)}
                      className="mt-2 inline-flex text-sm font-medium text-blue-700 hover:text-blue-800"
                    >
                      {pageCopy.relatedRegulationOpen}: {post.category} →
                    </Link>
                  </div>
                ) : null}

                <div className="rounded-lg border border-blue-100 bg-blue-50/60 p-8">
                  <h2 className="text-2xl font-bold tracking-normal text-foreground">
                    {post.ctaTitle ?? pageCopy.articleCtaTitle}
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-foreground/62">
                    {post.ctaBody ?? pageCopy.articleCtaBody}
                  </p>
                  <Link
                    href={getLocalizedMarketingPath(post.ctaHref ?? "/platform", locale)}
                    className="mt-6 inline-flex rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-hover)]"
                  >
                    {post.ctaButton ?? pageCopy.articleCtaButton}
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
