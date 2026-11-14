import {
  type LearningModule,
  type LearningTopic,
  learningDifficulties,
} from "./learn-types";

const hasText = (value: unknown): value is string =>
  typeof value === "string" && Boolean(value.trim());

export async function validateLearningContent(
  entries: readonly LearningModule[],
  topics: readonly LearningTopic[],
  registeredSlugs: readonly string[],
  readOverview: (slug: string) => Promise<string>,
) {
  const errors: string[] = [];
  for (const key of ["id", "slug", "order"] as const)
    if (new Set(entries.map((entry) => entry[key])).size !== entries.length)
      errors.push(`Duplicate learning module ${key}`);

  for (const entry of entries) {
    if (
      !hasText(entry.id) ||
      !hasText(entry.title) ||
      !hasText(entry.summary) ||
      !hasText(entry.slug) ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.slug) ||
      !Number.isInteger(entry.order) ||
      entry.order < 0 ||
      !topics.some((topic) => topic.id === entry.topicId) ||
      !learningDifficulties.includes(entry.difficulty) ||
      !["published", "planned"].includes(entry.status) ||
      typeof entry.recommended !== "boolean"
    )
      errors.push(`Invalid learning metadata ${entry.id}`);

    if (
      !Array.isArray(entry.lessonOutlines) ||
      !entry.lessonOutlines.length ||
      entry.lessonOutlines.some(
        (outline) =>
          !outline ||
          !hasText(outline.id) ||
          !hasText(outline.title) ||
          !hasText(outline.summary),
      ) ||
      new Set(entry.lessonOutlines.map((outline) => outline?.id)).size !==
        entry.lessonOutlines.length
    )
      errors.push(`Invalid learning outlines ${entry.id}`);

    if (entry.status !== "published") continue;
    if (!registeredSlugs.includes(entry.slug)) {
      errors.push(`Missing learning overview loader ${entry.id}`);
      continue;
    }
    try {
      if (!(await readOverview(entry.slug)).trim())
        errors.push(`Empty learning overview ${entry.id}`);
    } catch {
      errors.push(`Missing learning overview ${entry.id}`);
    }
  }
  return errors;
}
