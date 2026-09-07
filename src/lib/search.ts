/** Builds the /recipes URL for a free-text search. Empty queries go to the plain listing. */
export function buildSearchHref(query: string): string {
  const q = query.trim();
  return q ? `/recipes?q=${encodeURIComponent(q)}` : "/recipes";
}
