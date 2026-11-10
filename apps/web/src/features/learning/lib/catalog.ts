import type { CatalogEntry, TopicId } from "./types";
export const topics: {
  id: TopicId;
  label: string;
  variant: "blue" | "amber" | "rose";
}[] = [
  { id: "basics", label: "Basics", variant: "blue" },
  { id: "functions", label: "Functions", variant: "amber" },
  { id: "closures", label: "Closures", variant: "amber" },
  { id: "arrays", label: "Arrays", variant: "blue" },
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
export function problemHref(entry: CatalogEntry | undefined) {
  return entry?.status === "published"
    ? `/${entry.subjectId}/practice/${entry.slug}`
    : undefined;
}
