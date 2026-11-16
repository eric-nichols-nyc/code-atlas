import { type ProblemDefinition, validProblemInput } from "@workspace/problems";
import type { PracticeEntry } from "./practice-catalog";

export interface PracticeContentSubject {
  id: string;
  catalog: readonly PracticeEntry[];
  statementSlugs: readonly string[];
}

export async function validatePracticeContent(
  subjects: readonly PracticeContentSubject[],
  definitions: readonly ProblemDefinition[],
  readStatement: (subject: string, slug: string) => Promise<string>,
) {
  const errors: string[] = [];
  const published = subjects.flatMap((subject) =>
    subject.catalog.filter((entry) => entry.status === "published"),
  );
  if (
    new Set(published.map((entry) => entry.id)).size !== published.length ||
    new Set(definitions.map((problem) => problem.id)).size !==
      definitions.length
  )
    errors.push("Duplicate global problem ID.");
  if (
    published.length !== definitions.length ||
    definitions.some(
      (problem) => !published.some((entry) => entry.id === problem.id),
    )
  )
    errors.push("Published catalogs and public definitions must agree.");
  for (const subject of subjects) {
    for (const key of ["id", "slug", "order"] as const)
      if (
        new Set(subject.catalog.map((entry) => entry[key])).size !==
        subject.catalog.length
      )
        errors.push(`Duplicate ${subject.id} catalog ${key}`);
    for (const entry of subject.catalog.filter(
      (entry) => entry.status === "published",
    )) {
      const problem = definitions.find(
        (definition) => definition.id === entry.id,
      );
      if (
        !problem ||
        entry.subjectId !== subject.id ||
        problem.subjectId !== subject.id ||
        problem.slug !== entry.slug ||
        !subject.statementSlugs.includes(entry.slug)
      )
        errors.push(`Missing or mismatched problem ${entry.id}`);
      try {
        const statement = await readStatement(subject.id, entry.slug);
        if (
          !statement.trim() ||
          new TextEncoder().encode(statement).length > 16 * 1024
        )
          errors.push(`Invalid tutor statement ${entry.id}`);
      } catch {
        errors.push(`Missing tutor statement ${entry.id}`);
      }
    }
  }
  for (const problem of definitions) {
    const validExpected = (expected: unknown) => {
      if (problem.kind === "delay") return true;
      if (problem.kind === "valid-anagram")
        return typeof expected === "boolean";
      if (
        [
          "curry",
          "reduce-array",
          "function-composition",
          "majority-element",
        ].includes(problem.kind)
      )
        return typeof expected === "number" && Number.isFinite(expected);
      if (problem.kind === "memoize")
        return Boolean(
          expected &&
            !Array.isArray(expected) &&
            typeof expected === "object" &&
            "values" in expected &&
            Array.isArray(expected.values) &&
            "callCount" in expected &&
            Number.isInteger(expected.callCount),
        );
      return Array.isArray(expected);
    };
    if (
      !problem.starterCode.trim() ||
      !problem.solution.trim() ||
      !problem.samples.length ||
      !problem.samples.every(
        (sample) =>
          validProblemInput(problem, sample.input) &&
          validExpected(sample.expected),
      ) ||
      !problem.constraints.length
    )
      errors.push(`Invalid problem ${problem.id}`);
  }
  return errors;
}
