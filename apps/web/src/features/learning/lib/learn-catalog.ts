import type { LearningModule, LearningTopic } from "./learn-types";

export function learningCategories(
  entries: readonly LearningModule[],
  topics: readonly LearningTopic[],
) {
  const published = entries.filter((entry) => entry.status === "published");
  return [
    {
      id: "recommended",
      label: "Recommended",
      heading: "Recommended modules",
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
              heading: `${topic.label} modules`,
              count,
            },
          ]
        : [];
    }),
  ];
}

export function learningModules(
  entries: readonly LearningModule[],
  category = "recommended",
  query = "",
  difficulty = "all",
) {
  const search = query.trim().toLowerCase();
  return entries
    .filter(
      (entry) =>
        entry.status === "published" &&
        (category === "recommended"
          ? entry.recommended
          : entry.topicId === category) &&
        (difficulty === "all" || entry.difficulty === difficulty) &&
        `${entry.title} ${entry.summary}`.toLowerCase().includes(search),
    )
    .sort((a, b) => a.order - b.order);
}

export function learningModuleHref(
  entry: LearningModule | undefined,
  basePath = "/javascript/learn",
) {
  return entry?.status === "published"
    ? `${basePath}/${entry.slug}`
    : undefined;
}

export function findLearningModule(
  entries: readonly LearningModule[],
  slug: string,
) {
  return entries.find(
    (entry) => entry.status === "published" && entry.slug === slug,
  );
}
