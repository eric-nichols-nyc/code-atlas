import { filterCatalog, topics } from "../../learning/lib/catalog";
import type { CatalogEntry } from "../../learning/lib/types";

export interface PracticeEntry extends CatalogEntry {
  recommended: boolean;
  difficulty: string;
}

export function practiceCategories(entries: PracticeEntry[]) {
  const published = entries.filter((entry) => entry.status === "published");
  return [
    {
      id: "recommended",
      label: "Recommended",
      heading: "Recommended problems",
      count: published.filter((entry) => entry.recommended).length,
    },
    ...topics.flatMap((topic) => {
      const count = published.filter(
        (entry) => entry.topicId === topic.id,
      ).length;
      return count
        ? [
            {
              id: topic.id,
              label: topic.label,
              heading: `${topic.label} problems`,
              count,
            },
          ]
        : [];
    }),
  ];
}

export function practiceProblems(
  entries: PracticeEntry[],
  category: string,
  query = "",
) {
  const published = entries.filter(
    (entry) =>
      entry.status === "published" &&
      (category !== "recommended" || entry.recommended),
  );
  return filterCatalog(
    published,
    query,
    category === "recommended" ? "all" : category,
  );
}
