import { absoluteUrl } from "@/lib/seo/metadata";

type JsonLdValue = Record<string, unknown> | Array<Record<string, unknown>>;

function JsonLdScript({ data }: { data: JsonLdValue }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function BlogPostingJsonLd({
  description,
  headline,
  path,
  publishedAt,
}: {
  description: string;
  headline: string;
  path: string;
  publishedAt: string;
}) {
  const url = absoluteUrl(path);

  return (
    <JsonLdScript
      data={{
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        datePublished: publishedAt,
        description,
        headline,
        mainEntityOfPage: {
          "@id": url,
          "@type": "WebPage",
        },
        publisher: {
          "@type": "Organization",
          name: "Splnit.eu",
          url: absoluteUrl("/"),
        },
        url,
      }}
    />
  );
}

export function CollectionPageJsonLd({
  description,
  name,
  path,
}: {
  description: string;
  name: string;
  path: string;
}) {
  return (
    <JsonLdScript
      data={{
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        description,
        isPartOf: {
          "@type": "WebSite",
          name: "Splnit.eu",
          url: absoluteUrl("/"),
        },
        name,
        url: absoluteUrl(path),
      }}
    />
  );
}

export function WebPageJsonLd({
  description,
  name,
  path,
}: {
  description: string;
  name: string;
  path: string;
}) {
  return (
    <JsonLdScript
      data={{
        "@context": "https://schema.org",
        "@type": "WebPage",
        description,
        isPartOf: {
          "@type": "WebSite",
          name: "Splnit.eu",
          url: absoluteUrl("/"),
        },
        name,
        url: absoluteUrl(path),
      }}
    />
  );
}
