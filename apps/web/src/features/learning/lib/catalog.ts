import type { CatalogEntry, TopicId } from "./types";
export const topics: {
  id: TopicId;
  label: string;
  variant: "blue" | "amber" | "rose";
}[] = [
  { id: "basics", label: "Basics", variant: "blue" },
  { id: "functions", label: "Functions", variant: "amber" },
  { id: "async", label: "Async", variant: "rose" },
];
export function filterCatalog<T extends CatalogEntry>(
  entries: T[],
  query = "",
  topic = "all",
) {
  const q = query.trim().toLowerCase();
  return entries
    .filter(
      (e) =>
        (topic === "all" || e.topicId === topic) &&
        `${e.title} ${e.summary}`.toLowerCase().includes(q),
    )
    .sort((a, b) => a.order - b.order);
}
export function catalogCounts(entries: CatalogEntry[]) {
  return {
    available: entries.filter((x) => x.status === "published").length,
    planned: entries.filter((x) => x.status === "planned").length,
  };
}
export function firstPublished(entries: CatalogEntry[]) {
  return filterCatalog(entries).find((x) => x.status === "published");
}
export function problemHref(entry: CatalogEntry | undefined) {
  return entry?.status === "published"
    ? `/${entry.subjectId}/practice/${entry.slug}`
    : undefined;
}
