import { stripHtml } from "./source-parsers";

export function htmlToSourceText(html: string) {
  const bodyMatch = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i);
  const body = bodyMatch?.[1] ?? html;

  return (
    stripHtml(
      body
        .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
        .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
        .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, " ")
        .replace(/<svg\b[\s\S]*?<\/svg>/gi, " "),
    ) ?? ""
  )
    .normalize("NFKC")
    .replace(/\s+/g, " ")
    .trim();
}
