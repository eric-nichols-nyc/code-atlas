import { filterCatalog, topics } from "../../learning/lib/catalog";
import type { CatalogEntry } from "../../learning/lib/types";

export interface PracticeEntry extends CatalogEntry {
  recommended: boolean;
  difficulty: string;
}

export const practiceDifficulties: readonly string[] = [
  "Easy",
  "Medium",
  "Hard",
];

export type PracticeSort =
  | "default"
  | "easy-first"
  | "hard-first"
  | "category-asc"
  | "category-desc";

export function practiceCategories(
  entries: PracticeEntry[],
  categoryTopics: readonly (typeof topics)[number][] = topics,
) {
  const published = entries.filter((entry) => entry.status === "published");
  return [
    {
      id: "recommended",
      label: "Recommended",
      heading: "Recommended problems",
      count: published.filter((entry) => entry.recommended).length,
    },
    ...categoryTopics.flatMap((topic) => {
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
  difficulty = "all",
  {
    sort = "default",
    categoryTopics = topics,
  }: {
    sort?: PracticeSort;
    categoryTopics?: readonly (typeof topics)[number][];
  } = {},
) {
  const published = entries.filter(
    (entry) =>
      entry.status === "published" &&
      (difficulty === "all" || entry.difficulty === difficulty) &&
      (category !== "recommended" || entry.recommended),
  );
  const rows = filterCatalog(
    published,
    query,
    category === "recommended" ? "all" : category,
  );
  if (sort === "default") return rows;

  if (sort === "easy-first" || sort === "hard-first") {
    const levels =
      sort === "easy-first"
        ? practiceDifficulties
        : [...practiceDifficulties].reverse();
    const rank = new Map(levels.map((level, index) => [level, index]));
    return rows.sort(
      (a, b) =>
        (rank.get(a.difficulty) ?? levels.length) -
        (rank.get(b.difficulty) ?? levels.length),
    );
  }

  const direction = sort === "category-asc" ? 1 : -1;
  const labels = new Map(categoryTopics.map(({ id, label }) => [id, label]));
  return rows.sort(
    (a, b) =>
      direction *
      (labels.get(a.topicId) ?? a.topicId).localeCompare(
        labels.get(b.topicId) ?? b.topicId,
        "en",
      ),
  );
}
