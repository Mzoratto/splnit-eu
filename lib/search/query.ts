/**
 * Helpers for the org-scoped global search. Kept pure for unit testing.
 */

const MAX_QUERY_LENGTH = 80;

export function isSearchableQuery(query: string): boolean {
  const trimmed = query.trim();

  return trimmed.length >= 2 && trimmed.length <= MAX_QUERY_LENGTH;
}

/**
 * Escapes LIKE wildcards in user input and wraps it for a contains match,
 * so "100%" searches for the literal string instead of matching everything.
 */
export function buildSearchPattern(query: string): string {
  const escaped = query.trim().replace(/[\\%_]/g, (match) => `\\${match}`);

  return `%${escaped}%`;
}
